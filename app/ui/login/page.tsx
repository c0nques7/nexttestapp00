'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../button';
import Link from 'next/link';
import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
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
      const response = await fetch('/ui/api/login', { // Ensure this is your correct API route
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
        router.push('/ui/myhome'); 
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
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-3 text-2xl">Please log in to continue.</h1>
        <div className="w-full">
          {/* Identifier Input (Email or Username) */}
          <div>
            <label htmlFor="identifier" className="mb-3 mt-5 block text-xs font-medium text-gray-900">
              Email or Username
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="identifier"
                type="text" 
                name="identifier"
                placeholder="Enter your email or username"
                value={email}  // Reuse the 'email' state for simplicity
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          {/* Password Input */}
          <div className="mt-4">
            <label htmlFor="password" className="mb-3 block text-xs font-medium text-gray-900">
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6} 
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="flex h-8 items-end space-x-1">
          {error && (
            <div className="flex items-center text-red-500">
              <ExclamationCircleIcon className="mr-1 h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {/* Login Button */}
        <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log in '} 
          <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        
        <div className="mt-4 text-center">
    <Link href="/ui/register" className="text-sm font-medium text-gray-500 hover:text-gray-900">
        Register here
    </Link>
</div>
      </div>
    </form>
  );
};

export default LoginForm;
