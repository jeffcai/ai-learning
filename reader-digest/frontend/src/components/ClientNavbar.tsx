'use client';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';

const ClientNavbar = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded"></div>
                <span className="text-xl font-bold text-gray-900">Reader Digest</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return <Navbar />;
};

export default ClientNavbar;
