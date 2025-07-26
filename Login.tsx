import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from './icons';

interface LoginProps {
  onLoginSuccess: () => void;
}

const VALID_PASSWORDS = ['Dhakadispatch11@', 'Dhakadispatch@@11'];

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (VALID_PASSWORDS.includes(password)) {
      onLoginSuccess();
    } else {
      setPassword('');
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
        <img
          src="https://res.cloudinary.com/dy80ftu9k/image/upload/v1753507647/scs_cqidjz.png"
          alt="Dhaka Dispatch Logo"
          className="h-20 w-auto mx-auto mb-6"
        />
        <h1 className="text-2xl font-anton uppercase text-white text-center mb-2">
          Editorial Board Access
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Please enter the password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition pr-12"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
