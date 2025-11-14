"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { data: session, status } = useSession();

  // Handle session loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  // ✅ Navigation links (roles removed)
  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard' },
    { name: 'My Profile', href: '/user/profile' },
    { name: 'Incidents', href: '/hospital/incidents' },
    { name: 'Hospital Dashboard', href: '/hospital/dashboard' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left section */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <Link href="/" className="text-xl font-bold text-indigo-600">
                RIVOO
              </Link>

              {/* Nav links */}
              <div className="hidden sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right section - User Avatar */}
            <div className="hidden sm:flex sm:items-center">
              <button
                type="button"
                className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                id="user-menu-button"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="w-full text-left block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
