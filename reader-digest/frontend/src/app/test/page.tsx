'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Reader Digest Test Page
        </h1>
        <p className="text-gray-600 text-center">
          If you can see this page, the frontend is working correctly!
        </p>
        <div className="mt-4 text-center">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}
