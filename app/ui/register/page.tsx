'use client';
import { useState } from 'react';
import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '../button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous API errors on new submission
    setApiError(null); 

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          router.push('/login');  
        } else {
          const data = await response.json();
          setApiError(data.error || 'Registration failed.'); // Set specific API error
        }
      } catch (error) {
        setApiError('An error occurred during registration.');
      }
    }
  };

  // Client-Side Validation Logic
  const validateForm = (data) => {
    const errors = {};
    if (data.username.trim() === '') errors.username = 'Username is required';
    if (!validateEmail(data.email)) errors.email = 'Invalid email address';
    if (data.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
    <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
      <h1 className="mb-3 text-2xl">Please register to continue.</h1>

      <div className="w-full">
        {/* Username Input */}
        <div>
          <label htmlFor="username">Username</label>
          <div className="relative">
            <input 
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`peer block w-full rounded-md border ${errors.username ? 'border-red-500' : 'border-gray-200'} py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500`}
              placeholder="Enter your username"
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
        </div>

        {/* Email Input */}
        <div className="mt-4">
          <label htmlFor="email">Email</label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`peer block w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-200'} py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500`}
              placeholder="Enter your email address"
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>


        {/* Password Input */}
        <div className="mt-4">
          <label htmlFor="password">Password</label>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`peer block w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-200'} py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500`}
              placeholder="Enter password"
              required
              minLength={6}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>

          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
      </div>

        {apiError && ( 
          <div className="flex h-8 items-end space-x-1">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-xs text-red-500">{apiError}</p>
          </div>
        )}

        {/* Register Button */}
        <RegisterButton handleSubmit={handleSubmit} />

      </div>

      {/* Login Link */}
      <div className="mt-4 text-center">
        <Link href="/ui/login" className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-sm font-medium">
          Login here
          <ArrowRightIcon className="ml-2 h-5 w-5 text-black" />
        </Link>
      </div>
    </form>
  );
}



function RegisterButton({ handleSubmit }) {
  return (
    <Button 
      className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium" 
      onClick={handleSubmit} 
    >
      Register <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}

