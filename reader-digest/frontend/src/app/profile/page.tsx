'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, UserIcon, MailIcon, CalendarIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Admin
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {user.is_admin && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Username
                    </dt>
                    <dd className="text-sm text-gray-900">{user.username}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <MailIcon className="h-4 w-4 mr-2" />
                      Email
                    </dt>
                    <dd className="text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <UserIcon className="h-4 w-4 mr-2" />
                      First Name
                    </dt>
                    <dd className="text-sm text-gray-900">{user.first_name || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Last Name
                    </dt>
                    <dd className="text-sm text-gray-900">{user.last_name || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Member Since
                    </dt>
                    <dd className="text-sm text-gray-900">{formatDate(user.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Last Updated
                    </dt>
                    <dd className="text-sm text-gray-900">{formatDate(user.updated_at)}</dd>
                  </div>
                </dl>
              </div>

              {user.oauth_provider && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user.oauth_provider.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {user.oauth_provider}
                      </p>
                      <p className="text-xs text-gray-500">Connected account</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin"
                className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <UserIcon className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">Go to Admin Dashboard</span>
              </Link>
              <Link
                href="/admin/articles/new"
                className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <UserIcon className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">Add New Article</span>
              </Link>
              <Link
                href="/"
                className="flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <UserIcon className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">View Public Site</span>
              </Link>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.is_admin 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.is_admin ? 'Admin' : 'User'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Login Method</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.oauth_provider ? `OAuth (${user.oauth_provider})` : 'Email/Password'}
                </span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Security Notice</h4>
            <p className="text-xs text-yellow-700">
              Profile editing is currently not available. Contact an administrator if you need to update your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
