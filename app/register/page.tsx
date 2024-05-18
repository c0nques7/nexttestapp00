'use client';
import { useState, FormEvent, ChangeEvent } from 'react';
import {  ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '../components/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
}

type HandleSubmitType = (e: FormEvent<HTMLFormElement>) => void;

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous API errors on new submission
    setApiError(null); 

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch('/api/register', { // Correct API endpoint path
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          router.push('/app/login'); // Redirect to login on success
        } else {
          const data = await response.json();
          setApiError(data.error || 'Registration failed.');
        }
      } catch (error) {
        setApiError('An error occurred during registration.');
      }
    }
  };

  // Client-Side Validation Logic
  const validateForm = (data: FormData) => {
    const errors: Partial<FormData> = {};
    if (data.username.trim() === '') errors.username = 'Username is required';
    if (!validateEmail(data.email)) errors.email = 'Invalid email address';
    if (data.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#79966e]">
      <form className="neumorphic space-y-6 p-8" onSubmit={handleSubmit}>
        <div className="flex-1 rounded-lg">
          <h1 className="text-2xl font-semibold text-center mb-6">Welcome to PeakeFeed</h1>

          <div className="w-full">
            {/* Username Input */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <div className="relative">
                <input 
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`peer block w-full appearance-none rounded-md neumorphic-input border ${errors.username ? 'border-red-500' : ''} py-[9px] pl-10 pr-4 text-sm outline-none placeholder:text-gray-500`}
                  placeholder="Enter your username"
                  required
                />
              </div>
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`peer block w-full appearance-none rounded-md neumorphic-input border ${errors.email ? 'border-red-500' : ''} py-[9px] pl-10 pr-4 text-sm outline-none placeholder:text-gray-500`}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`peer block w-full appearance-none rounded-md neumorphic-input border ${errors.password ? 'border-red-500' : ''} py-[9px] pl-10 pr-4 text-sm outline-none placeholder:text-gray-500`}
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* API Error Message */}
            {apiError && (
              <div className="flex h-8 items-end space-x-1 mt-4">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-xs text-red-500">{apiError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Register Button */}
        <button type="submit" className="neumorphic-button w-full mt-4">
          Register <ArrowRightIcon className="ml-2 h-5 w-5 text-gray-50" />
        </button>

        {/* Login Link */}
        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-500 hover:underline">
            Already have an account? Login here
          </Link>
        </div>
      </form>
    </main>
  );
}

