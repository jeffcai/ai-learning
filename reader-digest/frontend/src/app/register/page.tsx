'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

interface FormData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    isValid: false,
    errors: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return;
    
    try {
      const response = await authAPI.checkAvailability('username', username);
      if (!response.data.available) {
        setValidationErrors(prev => ({
          ...prev,
          username: 'Username is already taken'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          username: undefined
        }));
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
    }
  };

  // Check email availability
  const checkEmailAvailability = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;
    
    try {
      const response = await authAPI.checkAvailability('email', email);
      if (!response.data.available) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Email is already registered'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          email: undefined
        }));
      }
    } catch (error) {
      console.error('Error checking email availability:', error);
    }
  };

  // Validate password
  const validatePassword = async (password: string) => {
    if (password.length === 0) {
      setPasswordValidation({ isValid: false, errors: [] });
      return;
    }

    try {
      const response = await authAPI.validatePassword(password);
      setPasswordValidation({
        isValid: response.data.valid,
        errors: response.data.errors || []
      });
    } catch (error) {
      console.error('Error validating password:', error);
      setPasswordValidation({
        isValid: false,
        errors: ['Error validating password']
      });
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear general errors when user starts typing
    if (validationErrors.general) {
      setValidationErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  // Handle username blur (check availability)
  const handleUsernameBlur = () => {
    if (formData.username) {
      checkUsernameAvailability(formData.username);
    }
  };

  // Handle email blur (check availability)
  const handleEmailBlur = () => {
    if (formData.email) {
      checkEmailAvailability(formData.email);
    }
  };

  // Handle password change (validate in real-time)
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    
    // Debounce password validation
    const timeoutId = setTimeout(() => {
      validatePassword(password);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if there are any validation errors
    if (validationErrors.username || validationErrors.email || !passwordValidation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        general: 'Please fix the errors above before submitting'
      }));
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await register(formData);
      if (result.success) {
        router.push('/admin');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.error) {
        setValidationErrors(prev => ({
          ...prev,
          general: error.response.data.error
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          general: 'Registration failed. Please try again.'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start tracking your reading journey
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {validationErrors.general && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
              {validationErrors.general}
            </div>
          )}

          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="sr-only">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="First Name (optional)"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="sr-only">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Last Name (optional)"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                onBlur={handleUsernameBlur}
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  validationErrors.username ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Username"
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className={`appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border ${
                    formData.password && !passwordValidation.isValid ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L18.75 18.75" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password validation feedback */}
              {formData.password && (
                <div className="mt-2">
                  <div className={`text-sm ${passwordValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.isValid ? (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Password meets all requirements
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium mb-1">Password requirements:</p>
                        <ul className="text-xs space-y-1">
                          <li className={passwordValidation.errors.includes('at least 8 characters') ? 'text-red-600' : 'text-green-600'}>
                            • At least 8 characters
                          </li>
                          <li className={passwordValidation.errors.includes('uppercase letter') ? 'text-red-600' : 'text-green-600'}>
                            • One uppercase letter
                          </li>
                          <li className={passwordValidation.errors.includes('lowercase letter') ? 'text-red-600' : 'text-green-600'}>
                            • One lowercase letter
                          </li>
                          <li className={passwordValidation.errors.includes('digit') ? 'text-red-600' : 'text-green-600'}>
                            • One number
                          </li>
                          <li className={passwordValidation.errors.includes('special character') ? 'text-red-600' : 'text-green-600'}>
                            • One special character
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !passwordValidation.isValid || !!validationErrors.username || !!validationErrors.email}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading || !passwordValidation.isValid || !!validationErrors.username || !!validationErrors.email
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
