import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { User, LogOut, BookOpen, FileText, Settings } from 'lucide-react';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { user, logout } = useAuth();

  return (
    <nav className={cn("bg-white shadow-sm border-b", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Reader Digest</span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Public Articles
              </Link>
              <Link
                href="/digests"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Weekly Digests
              </Link>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden sm:flex sm:items-center sm:space-x-4">
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center space-x-1"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                  <Link
                    href="/admin/articles/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Add Article
                  </Link>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {user.first_name || user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
