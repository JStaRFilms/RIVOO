"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, LiveCase, HealthInfo, Location, SOSAlertData } from '@/lib/types'; 
import { Incident, Facility } from '@prisma/client';

interface DashboardContextType {
  sosModalOpen: boolean;
  reportModalOpen: boolean;
  sendingAlert: boolean;
  alertData: SOSAlertData | null;
  location: Location | null;
  liveCase: LiveCase | null;
  recentAlerts: Alert[];
  healthInfo: HealthInfo;
  setSOSModalOpen: (open: boolean) => void;
  setReportModalOpen: (open: boolean) => void;
  handleSOSClick: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [sosModalOpen, setSOSModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertData, setAlertData] = useState<SOSAlertData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [liveCase, setLiveCase] = useState<LiveCase | null>(null);

  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([
    { date: 'Nov 3', alert: 'Breathing Issue', status: 'Resolved', hospital: 'Lagoon', id: 'RIV-054' },
    { date: 'Nov 3', alert: 'Road Injury', status: 'Declined', hospital: 'Lagoon', id: 'RIV-045' },
  ]);

  const healthInfo: HealthInfo = {
    bloodType: '0+',
    allergies: 'None',
    conditions: 'Asthma',
    medication: 'Ventolin',
  };

  // Get User Location on Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  }, []);

  const sendSOSAlert = async (currentLocation: Location | null) => {
    if (!currentLocation) {
      console.error("Cannot send SOS without location.");
      setSendingAlert(false);
      return;
    }

    try {
      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.statusText} - ${errorData.details || ''}`);
      }

      const data: { 
        incident: Incident & { publicId?: string }; 
        facilities: (Facility & { distance?: number })[] 
      } = await response.json();
      
      const { incident, facilities } = data;

      const timestamp = new Date(incident.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      // Set data for the SOS Modal
      const alert: SOSAlertData = {
        caseId: incident.publicId || incident.id,
        location: currentLocation,
        timestamp,
        bloodType: healthInfo.bloodType,
        conditions: healthInfo.conditions,
        allergies: healthInfo.allergies,
        medication: healthInfo.medication,
      };
      setAlertData(alert);
      setSOSModalOpen(true);

      // Get matched hospital
      const matchedHospital = facilities.length > 0 
        ? `${facilities[0].name} (${Math.round((facilities[0].distance || 0) / 1000)}km away)` 
        : 'Searching...';

      // Create live case for the dashboard
      const newCase: LiveCase = {
        caseId: incident.publicId || incident.id,
        hospitalFound: facilities.length > 0,
        hospital: matchedHospital,
        progress: 0,
        timestamp,
      };
      setLiveCase(newCase);

      // Simulate progress updates
      setTimeout(() => {
        setLiveCase(prev => prev ? { ...prev, progress: 1 } : null);
      }, 3000);

      setTimeout(() => {
        setLiveCase(prev => prev ? { ...prev, progress: 2 } : null);
      }, 6000);

      // Add to recent alerts
      const newAlert: Alert = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        alert: 'Emergency SOS',
        status: 'In Progress',
        hospital: facilities[0]?.name || 'Matching...',
        id: incident.publicId || incident.id,
      };
      setRecentAlerts(prev => [newAlert, ...prev]);

    } catch (error) {
      console.error("Failed to send SOS alert:", error);
      alert(error instanceof Error ? error.message : 'Failed to send SOS alert. Please try again.');
    } finally {
      setSendingAlert(false);
    }
  };

  const handleSOSClick = () => {
    setSendingAlert(true);

    if ('geolocation' in navigator && !location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(newLocation);
          sendSOSAlert(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
          setSendingAlert(false);
        }
      );
    } else {
      sendSOSAlert(location);
    }
  };

  const value = {
    sosModalOpen,
    reportModalOpen,
    sendingAlert,
    alertData,
    location,
    liveCase,
    recentAlerts,
    healthInfo,
    setSOSModalOpen,
    setReportModalOpen,
    handleSOSClick,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};