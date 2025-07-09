import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  push,
  remove,
  update,
  onChildAdded,
  onChildRemoved,
  onValue,
  serverTimestamp,
  get,
} from 'firebase/database';

import {
  User,
  Point,
  DrawEvent,
  PlayerState,
  InitialStateEvent
} from '../types';
import {
  MAX_USERS,
  USER_COLORS,
  MAX_FOOD_DOTS,
  FOOD_SPAWN_INTERVAL
} from '../constants';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

type EventCallback = (data: any) => void;

class RealtimeService {
  private userId: string | null = null;
  private listeners: Record<string, EventCallback[]> = {};
  private foodSpawnInterval: NodeJS.Timer | null = null;

  public async join(): Promise<User | null> {
    const usersSnap = await get(ref(db, 'users'));
    const users = usersSnap.val() || {};
    const userCount = Object.keys(users).length;

    if (userCount >= MAX_USERS) return null;

    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.userId = userId;
    const newUser: User = {
      id: userId,
      name: `User ${userCount + 1}`,
      color: USER_COLORS[userCount % USER_COLORS.length],
    };

    await set(ref(db, `users/${userId}`), newUser);

    // Listen for new users
    onChildAdded(ref(db, 'users'), (snap) => {
      this.emit('user-joined', snap.val());
    });

    onChildRemoved(ref(db, 'users'), (snap) => {
      this.emit('user-left', snap.key);
    });

    // Listen to drawing updates
    onValue(ref(db, 'drawing'), (snap) => {
      const val = snap.val();
      if (val) this.emit('drawing-data', val);
    });

    // Listen to food state
    onValue(ref(db, 'food'), (snap) => {
      const food = snap.val();
      if (food) this.emit('food-state-updated', Object.values(food));
    });

    // Start spawning food
    this.startFoodSpawner();

    return newUser;
  }

  public leave(): void {
    if (!this.userId) return;
    remove(ref(db, `users/${this.userId}`));
  }

  public updateUserName(name: string): void {
    if (!this.userId) return;
    update(ref(db, `users/${this.userId}`), { name });
  }

  public draw(drawEvent: DrawEvent): void {
    set(ref(db, 'drawing'), drawEvent);
  }

  public updatePlayerPosition(userId: string, playerState: PlayerState): void {
    set(ref(db, `players/${userId}`), playerState);
  }

  public eatFood(userId: string, foodIndex: number): void {
    const foodRef = ref(db, `food`);
    get(foodRef).then((snap) => {
      const foodList = snap.val();
      if (!foodList) return;
      const keys = Object.keys(foodList);
      const keyToRemove = keys[foodIndex];
      if (keyToRemove) remove(ref(db, `food/${keyToRemove}`));
    });
  }

  private startFoodSpawner(): void {
    if (this.foodSpawnInterval) clearInterval(this.foodSpawnInterval);

    this.foodSpawnInterval = setInterval(async () => {
      const foodRef = ref(db, 'food');
      const snap = await get(foodRef);
      const foodCount = snap.exists() ? Object.keys(snap.val()).length : 0;

      if (foodCount < MAX_FOOD_DOTS) {
        const newFood: Point = {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        };
        push(foodRef, newFood);
      }
    }, FOOD_SPAWN_INTERVAL);
  }

  // 🔁 Internal Event Handling
  public on(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  private emit(event: string, data: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((cb) => cb(data));
  }
}

export const realtimeService = new RealtimeService();
