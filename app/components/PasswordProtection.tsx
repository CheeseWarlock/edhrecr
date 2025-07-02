'use client';

import { useState, useEffect } from 'react';
import { Proza_Libre } from "next/font/google";

const prozaLibre = Proza_Libre({ weight: ["400", "600"], subsets: ["latin"] });

type AUTHENTICATION_STATE = "CHECKING" | "AUTHENTICATED" | "UNAUTHENTICATED";

export default function PasswordProtection({ children }: { children: React.ReactNode }) {
  const [authenticationState, setAuthenticationState] = useState<AUTHENTICATION_STATE>("CHECKING");
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      const data = await response.json();
      setAuthenticationState(data.authenticated === true ? "AUTHENTICATED" : "UNAUTHENTICATED");
    } catch (error) {
      console.error('Failed to check authentication:', error);
      setAuthenticationState("UNAUTHENTICATED");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthenticationState("AUTHENTICATED");
        setPassword('');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authenticationState === "CHECKING") {
    return (
      <div className={`flex items-center justify-center h-screen ${prozaLibre.className}`}>
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show password form if not authenticated
  if (authenticationState === "UNAUTHENTICATED") {
    return (
      <div className={`flex items-center justify-center h-screen bg-[#222] ${prozaLibre.className}`}>
        <div className="bg-[#444] p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Game Builder</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#2694AF] rounded-md"
                placeholder="Enter password"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-[#7C9B13] text-white py-2 px-4 rounded-md hover:saturate-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show protected content if authenticated
  return <>{children}</>;
} 