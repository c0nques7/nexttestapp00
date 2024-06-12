'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/button';
import Link from 'next/link';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); 
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', { // Ensure this is your correct API route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });

      if (response.ok) {
        // Successful login
        const data = await response.json();
        console.log('Login successful:', data);
        //Save JWT and move to myHome page
        localStorage.setItem('token', data.jwt);
        router.push('/myhome'); 
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <form className="neumorphic login" onSubmit={handleSubmit}>
        <h1 className="text-2xl text-center mb-4">Log in to PeakeFeed</h1>
        <div>
          {/* Identifier Input */}
          <div className="mb-6">
            <label htmlFor="identifier" className="block text-gray-700 text-sm font-bold mb-2">
              Email or Username
            </label>
            <div className="relative">
              <input
                className="peer block w-full appearance-none rounded-md neumorphic-input border-none py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-500"
                id="identifier"
                type="text"
                name="identifier"
                placeholder="Enter your email/username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full appearance-none rounded-md neumorphic-input border-none py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center text-red-500 mt-2">
              <ExclamationCircleIcon className="mr-1 h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Login Button */}
        <Button type="submit" className="neumorphic-button login" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log in '} 
          <ArrowRightIcon className="ml-2 h-5 w-5 text-gray-50" />
        </Button>

        {/* Register Link */}
        <div className="mt-4 text-center">
          <Link href="/register" className="text-blue-500 hover:underline">
            <p>Don&apos;t have an account? Register here</p>
          </Link>
        </div>
      </form>
  );
};

export default LoginForm;
