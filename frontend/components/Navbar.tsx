'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              User Management System
            </h1>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            {user && (
              <>
                <div className="text-xs sm:text-sm flex-1 sm:flex-initial">
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
