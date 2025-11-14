"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/context/UserDashboardContext';
import { SafetyStatusCard } from '@/components/user-dashboard/SafetyStatusCard';
import { LiveCaseCard } from '@/components/user-dashboard/LiveCaseCard';
import { RecentAlertsTable } from '@/components/user-dashboard/RecentAlertsTable';
import { MyHealthCard } from '@/components/user-dashboard/MyHealthCard';
import { Header } from '@/components/user-dashboard/Header';
import { useSession } from 'next-auth/react';
import { useProfileCompletion } from '../../../../hooks/userProfileCompletion';
import { Phone } from 'lucide-react';

// Welcome screen for incomplete profiles
function IncompleteProfileScreen({ userName, userInitials }: { userName: string; userInitials: string }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-user-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-medium text-user-primary">{userInitials}</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-user-text mb-2">
            Welcome, {userName}!
          </h1>
          <p className="text-user-text/60">
            Let's set up your profile to get started
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-heading font-bold text-user-text mb-4">
              Complete Your Profile
            </h2>
            <p className="text-user-text/70 mb-6">
              Please complete your profile and medical information sections to ensure first responders have all necessary information in case of an emergency.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-medium text-user-text mb-1">Medical Information</h3>
                <p className="text-sm text-user-text/70">
                  Add your blood type, allergies, and medical conditions
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-medium text-user-text mb-1">Emergency Contact</h3>
                <p className="text-sm text-user-text/70">
                  Provide a contact person for emergency situations
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/user/dashboard/profile')}
            className="w-full bg-user-primary hover:bg-user-primary/90 text-white rounded-lg py-3 font-medium transition-colors"
          >
            Complete Profile
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-user-text/60">
            This will only take a minute and helps keep you safe
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const {
    location,
    liveCase,
    recentAlerts,
    healthInfo,
    setReportModalOpen,
  } = useDashboard();

  const { data: session } = useSession();
  const { isComplete, isLoading } = useProfileCompletion();
  const router = useRouter();

  const userName = session?.user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-user-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-user-text/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show incomplete profile screen if profile is not complete
  if (!isComplete) {
    return <IncompleteProfileScreen userName={userName} userInitials={userInitials} />;
  }

  // Show full dashboard if profile is complete
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Greeting Section */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-user-primary/10 flex items-center justify-center">
          <span className="text-base font-medium text-user-primary">{userInitials}</span>
        </div>
        <h2 className="text-xl lg:text-2xl font-heading font-bold text-user-text">
          Hello, {userName}. Are you safe today?
        </h2>
      </div>

      {/* Safety Status Card */}
      <SafetyStatusCard location={location} />

      {/* Report for Another - Mobile Button */}
      <button
        onClick={() => setReportModalOpen(true)}
        className="sm:hidden w-full bg-user-warning hover:bg-user-warning/90 text-white rounded-xl p-6 mb-6 flex items-center gap-4 transition-all shadow-sm hover:shadow-md"
      >
        <Phone className="w-8 h-8" />
        <span className="text-lg font-heading font-bold">Report for Another</span>
      </button>

      {/* Live Case Status Card */}
      <LiveCaseCard liveCase={liveCase} />

      {/* Recent Alerts Card */}
      <RecentAlertsTable alerts={recentAlerts} />

      {/* My Health Card */}
      <MyHealthCard healthInfo={healthInfo} />
    </div>
  );
}