"use client";
import React, { useState, useEffect } from "react";
import { DashboardProvider, useDashboard } from "@/context/UserDashboardContext"; 
import { Sidebar } from "@/components/user-dashboard/Sidebar";
import { Header } from "@/components/user-dashboard/Header";
import { SOSModal } from "@/components/modals/SOSModal";
import ReportModal from "@/components/user-dashboard/ReportModal";
import { useSession } from "next-auth/react";

// This internal component consumes the context
const DashboardLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("USER"); // Default role
  const { data: session } = useSession();
  const {
    sosModalOpen,
    setSOSModalOpen,
    reportModalOpen,
    setReportModalOpen,
    handleSOSClick,
    sendingAlert,
    alertData,
  } = useDashboard();

  // Fetch user role from session or API
  useEffect(() => {
    if (session?.user) {
      // If role is in session
      if ('role' in session.user) {
        setUserRole(session.user.role as string);
      }
      // Or fetch from API if needed
      // fetchUserRole();
    }
  }, [session]);

  return (
    <div className="flex h-screen bg-user-bg font-sans">
      <SOSModal
        isOpen={sosModalOpen}
        onClose={() => setSOSModalOpen(false)}
        alertData={alertData}
      />
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        <Header
          setSidebarOpen={setSidebarOpen}
          setReportModalOpen={setReportModalOpen}
          handleSOSClick={handleSOSClick}
          sendingAlert={sendingAlert}
        />
        
        {children}
      </main>
    </div>
  );
};

// This is the main export - only receives children from Next.js
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </DashboardProvider>
  );
}