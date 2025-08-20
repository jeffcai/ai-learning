'use client';

import React, { useState, useEffect } from 'react';

export default function HealthCheck() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    const checkBackend = async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      setApiUrl(url);
      
      try {
        const response = await fetch(`${url}/api/v1/articles`);
        if (response.ok) {
          setBackendStatus('success');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        setBackendStatus('error');
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-white border rounded-lg p-4 shadow-md">
      <h3 className="font-semibold text-sm mb-2">System Status</h3>
      <div className="space-y-1 text-xs">
        <div className="flex items-center space-x-2">
          <span>Frontend:</span>
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Running</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Backend:</span>
          <span 
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'success' ? 'bg-green-500' : 
              backendStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}
          ></span>
          <span>
            {backendStatus === 'success' ? 'Connected' : 
             backendStatus === 'error' ? 'Error' : 'Checking...'}
          </span>
        </div>
        <div className="text-gray-500 text-xs">
          API: {apiUrl}
        </div>
      </div>
    </div>
  );
}
