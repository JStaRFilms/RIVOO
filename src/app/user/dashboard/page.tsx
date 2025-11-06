"use client";
import React from 'react';
import { Phone } from 'lucide-react';
import { useDashboard } from '@/context/UserDashboardContext';
import { SafetyStatusCard } from '@/components/user-dashboard/SafetyStatusCard';  
import { LiveCaseCard } from '@/components/user-dashboard/LiveCaseCard'; 
import { RecentAlertsTable } from '@/components/user-dashboard/RecentAlertsTable';
import { MyHealthCard } from '@/components/user-dashboard/MyHealthCard'; 
import { useSession } from 'next-auth/react';

export default function UserDashboardPage() {
  const {
    location,
    liveCase,
    recentAlerts,
    healthInfo,
    setReportModalOpen,
  } = useDashboard();
  
  // You were missing this line to initialize 'session'
  const { data: session } = useSession(); 
  
  const userName = session?.user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        {/* Greeting Section */}
        <div className="flex items-center gap-3 mb-8">
          {/* Corrected styling and added userInitials variable */}
          <div className="w-12 h-12 rounded-full bg-user-primary/10 flex items-center justify-center">
            <span className="text-base font-medium text-user-primary">{userInitials}</span>
          </div>
          {/* Corrected styling and string interpolation */}
          <h2 className="text-xl lg:text-2xl font-heading font-bold text-user-text">
            Hello, {userName}. Are you safe today?
          </h2>
        </div>

        {/* Safety Status Card */}
        <SafetyStatusCard location={location} />
        
        {/* Report for Another - Mobile Button */}
        <button
          onClick={() => setReportModalOpen(true)}
          // Corrected styling
          className="sm:hidden w-full bg-user-warning hover:bg-user-warning/90 text-white rounded-xl p-6 mb-6 flex items-center gap-4 transition-all shadow-sm hover:shadow-md"
        >
          <Phone className="w-8 h-8" />
          {/* Corrected styling */}
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