"use client";
import React, { useState } from "react";
import { DashboardProvider, useDashboard } from "@/context/UserDashboardContext"; 
import { Sidebar } from "@/components/user-dashboard/Sidebar";
import { Header } from "@/components/user-dashboard/Header";
import { SOSModal } from "@/components/modals/SOSModal";
import ReportModal from "@/components/user-dashboard/ReportModal";

// This internal component consumes the context
const DashboardLayoutContent = ({ children, userRole }: { children: React.ReactNode, userRole: string }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    // Note: currentView and setCurrentView are removed
    sosModalOpen,
    setSOSModalOpen,
    reportModalOpen,
    setReportModalOpen,
    handleSOSClick,
    sendingAlert,
    alertData,
  } = useDashboard();

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
        
        {/* Page Content (e.g., your dashboard or profile page) */}
        {children}
      </main>
    </div>
  );
};

// This is the main export that wraps everything in the context provider
export default function DashboardLayout({ children, userRole }: { children: React.ReactNode, userRole: string }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent userRole={userRole}>
        {children}
      </DashboardLayoutContent>
    </DashboardProvider>
  );
}