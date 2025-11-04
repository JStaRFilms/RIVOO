'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: string;
  userName?: string | null;
  userEmail?: string | null;
}

const DashboardLayout = ({ children, userRole = 'USER', userName, userEmail }: DashboardLayoutProps) => {

  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard', roles: ['USER', 'HOSPITAL_STAFF', 'ADMIN'] },
    { name: 'My Profile', href: '/user/profile', roles: ['USER', 'HOSPITAL_STAFF', 'ADMIN'] },
    { name: 'Incidents', href: '/hospital/incidents', roles: ['HOSPITAL_STAFF', 'ADMIN'] },
    { name: 'Hospital Dashboard', href: '/hospital/dashboard', roles: ['HOSPITAL_STAFF', 'ADMIN'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="h-screen bg-user-bg font-sans">
      {/* Mobile-first Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/user/dashboard" className="text-xl font-bold text-user-primary font-heading">
                RIVOO
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-user-primary/10 flex items-center justify-center">
                <span className="text-user-primary font-medium text-sm">
                  {userName?.charAt(0) || 'U'}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="text-user-secondary hover:text-user-text p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className="mt-3 flex space-x-1 overflow-x-auto">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="whitespace-nowrap px-4 py-2 text-sm font-medium text-user-secondary hover:text-user-primary hover:bg-user-primary/5 rounded-xl transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content - Mobile first */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
