"use client";
import React from 'react';
import { useSession } from 'next-auth/react';
import { Menu, Mail, Bell, ChevronDown, Phone, Loader } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  setReportModalOpen: (open: boolean) => void;
  handleSOSClick: () => void;
  sendingAlert: boolean;
}

export const Header = ({ 
  setSidebarOpen, 
  setReportModalOpen, 
  handleSOSClick, 
  sendingAlert 
}: HeaderProps) => {
  const { data: session } = useSession();
  
  const userName = session?.user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-prussian-blue"
          >
            <Menu size={24} />
          </button>
          <span className="text-sm text-slate-gray hidden md:block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Report for Another Button */}
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-2 px-4 lg:px-6 py-2.5 bg-orange-peel hover:bg-orange-peel/90 text-white rounded-lg font-lato font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Phone size={18} />
            <span className="hidden md:inline">Report</span>
          </button>

          {/* SOS Button */}
          <button
            onClick={handleSOSClick}
            disabled={sendingAlert}
            className="flex items-center gap-2 px-4 lg:px-6 py-2.5 bg-fire-brick hover:bg-fire-brick/90 text-white rounded-lg font-lato font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingAlert ? (
              <>
                <Loader className="animate-spin" size={18} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>SOS</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </>
            )}
          </button>

          {/* User Profile & Notifications - Desktop Only */}
          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-gray-200 ml-2">
            <button className="relative text-prussian-blue">
              <Mail size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-fire-brick rounded-full" />
            </button>
            <button className="relative text-prussian-blue">
              <Bell size={20} />
            </button>
            <button className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sea-green/10 flex items-center justify-center">
                <span className="text-xs font-medium text-sea-green">{userInitials}</span>
              </div>
              <span className="hidden lg:block text-sm font-medium text-prussian-blue truncate max-w-[100px]">
                {userName}
              </span>
              <ChevronDown size={16} className="text-slate-gray" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};