"use client";
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { X, LogOut, Activity, User, AlertCircle, Phone, Settings, ShieldCheck } from 'lucide-react';
import { NavItem } from './NavItem';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: string;
}

// Your role-based navigation array
const navigation = [
  { name: 'Dashboard', href: '/user-dashboard', icon: Activity, roles: ['USER'] },
  { name: 'My Profile', href: '/user-profile', icon: User, roles: ['USER'] },
  { name: 'SOS Card', href: '/user-sos', icon: AlertCircle, roles: ['USER'] },
  { name: 'My Health', href: '/user-health', icon: Activity, roles: ['USER'] },
  // Add hospital/admin routes
  { name: 'Incidents', href: '/hospital/incidents', icon: ShieldCheck, roles: ['HOSPITAL_STAFF', 'ADMIN'] },
  { name: 'Hospital Dashboard', href: '/hospital/dashboard', icon: ShieldCheck, roles: ['HOSPITAL_STAFF', 'ADMIN'] },
  // Universal routes
  { name: 'Contact', href: '/contact', icon: Phone, roles: ['USER', 'HOSPITAL_STAFF', 'ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['USER', 'HOSPITAL_STAFF', 'ADMIN'] },
];

export const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  userRole 
}: SidebarProps) => {
  const { data: session } = useSession();

  // Filter navigation based on user's role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  const userName = session?.user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-prussian-blue font-lato">RIVOO</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-prussian-blue"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1 text-black">
          {filteredNavigation.map((item) => (
            <NavItem
              key={item.name}
              icon={item.icon}
              label={item.name}
              href={item.href}
            />
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sea-green/10 flex items-center justify-center">
              <span className="text-sm font-medium text-sea-green">{userInitials}</span>
            </div>
            <span className="text-sm font-medium text-prussian-blue truncate">{userName}</span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-gray hover:bg-seasalt rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};