"use client";

import React from 'react';
import { Menu, Mail, Bell, ChevronDown, Phone, Loader, AlertCircle } from 'lucide-react';
import { useProfileCompletion } from '../../../hooks/userProfileCompletion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  setReportModalOpen: (open: boolean) => void;
  handleSOSClick: () => void;
  sendingAlert: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  setSidebarOpen,
  setReportModalOpen,
  handleSOSClick,
  sendingAlert,
}) => {
  const { isComplete, isLoading } = useProfileCompletion();
  const { data: session } = useSession();
  const router = useRouter();

  const userName = session?.user?.name || 'User';
  const userInitials =
    userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const isButtonDisabled = isLoading || !isComplete;

  const handleSOSButtonClick = () => {
    if (!isComplete) {
      router.push('/user/dashboard/profile');
    } else {
      handleSOSClick();
    }
  };

  const handleReportButtonClick = () => {
    if (!isComplete) {
      router.push('/user/dashboard/profile');
    } else {
      setReportModalOpen(true);
    }
  };

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

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Profile incomplete warning */}
          {!isComplete && !isLoading && (
            <div className="hidden md:flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">
                Complete your profile to use emergency features
              </span>
            </div>
          )}

          {/* Report Button */}
          <button
            onClick={handleReportButtonClick}
            disabled={isButtonDisabled}
            className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-lg font-lato font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
              isButtonDisabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-orange-peel hover:bg-orange-peel/90 text-white'
            }`}
          >
            <Phone size={18} />
            <span className="hidden md:inline">Report</span>
          </button>

          {/* SOS Button */}
          <button
            onClick={handleSOSButtonClick}
            disabled={isButtonDisabled || sendingAlert}
            className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-lg font-lato font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isButtonDisabled || sendingAlert
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-fire-brick hover:bg-fire-brick/90 text-white'
            }`}
          >
            {sendingAlert ? (
              <>
                <Loader className="animate-spin" size={18} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>SOS</span>
              </>
            )}
          </button>

          {/* User Profile and Notifications (Desktop only) */}
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

      {/* Mobile Profile Incomplete Warning */}
      {!isComplete && !isLoading && (
        <div className="sm:hidden mb-2 flex items-start gap-3 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-lg border-t border-amber-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Profile Incomplete</p>
            <p className="text-xs text-amber-600 mt-1">
              Complete your profile to use Report and SOS features
            </p>
          </div>
        </div>
      )}

      {/* Mobile Floating SOS Button */}
      <button
        onClick={handleSOSButtonClick}
        disabled={isButtonDisabled || sendingAlert}
        className={`sm:hidden fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 transition-all ${
          isButtonDisabled || sendingAlert
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-fire-brick hover:bg-fire-brick/90 active:scale-95'
        }`}
      >
        {sendingAlert ? (
          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-2xl text-white font-bold">SOS</span>
        )}
      </button>
    </header>
  );
};
