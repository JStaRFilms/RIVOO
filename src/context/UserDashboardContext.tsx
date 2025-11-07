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

  // Poll for incident status updates
  useEffect(() => {
    if (!liveCase || liveCase.progress >= 2) return; // Stop polling after "En Route"

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/incidents/${liveCase.caseId}`);
        
        if (!response.ok) {
          console.error(`Failed to fetch incident: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        
        // Check if incident exists in response
        if (!data || !data.incident) {
          console.error('No incident data in response:', data);
          return;
        }
        
        const incident = data.incident;
        console.log('Polling incident status:', incident.status, 'Current progress:', liveCase.progress);

        // Update based on incident status
        if (incident.status === 'ASSIGNED' && liveCase.progress === 0) {
          // Hospital has accepted
          console.log('✅ Hospital accepted! Moving to Accepted state');
          setLiveCase(prev => prev ? { ...prev, progress: 1 } : null);
        } else if (incident.status === 'IN_PROGRESS' && liveCase.progress === 1) {
          // Ambulance en route
          console.log('🚑 Ambulance dispatched! Moving to En Route state');
          setLiveCase(prev => prev ? { ...prev, progress: 2 } : null);
        } else if (incident.status === 'RESOLVED') {
          // Case completed
          console.log('✅ Case resolved! Moving to Completed state');
          setLiveCase(prev => prev ? { ...prev, progress: 3 } : null);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling incident status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [liveCase]);

  const sendSOSAlert = async (currentLocation: Location | null) => {
    if (!currentLocation) {
      console.error("Cannot send SOS without location.");
      setSendingAlert(false);
      return;
    }

    try {
      // Step 1: Show "Matching..." state immediately
      const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      const matchingCase: LiveCase = {
        caseId: 'Generating...',
        hospitalFound: false,
        hospital: 'Matching...',
        progress: 0, // Still in matching phase
        timestamp,
      };
      setLiveCase(matchingCase);

      // Step 2: Call the API
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

      // Use the actual incident ID for tracking
      const incidentId = incident.id;

      // Step 3: Update with hospital found
      const finalTimestamp = new Date(incident.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      // Set data for the SOS Modal
      const alert: SOSAlertData = {
        caseId: incidentId,
        location: currentLocation,
        timestamp: finalTimestamp,
        bloodType: healthInfo.bloodType,
        conditions: healthInfo.conditions,
        allergies: healthInfo.allergies,
        medication: healthInfo.medication,
      };
      setAlertData(alert);
      setSOSModalOpen(true);

      // Get matched hospital name and distance
      const matchedHospitalName = facilities.length > 0 
        ? facilities[0].name
        : 'No hospitals available';
      
      const distance = facilities.length > 0 && facilities[0].distance
        ? `${Math.round(facilities[0].distance / 1000)}km away`
        : '';

      // Step 4: Update live case with hospital found
      const updatedCase: LiveCase = {
        caseId: incidentId,
        hospitalFound: facilities.length > 0,
        hospital: distance ? `${matchedHospitalName} (${distance})` : matchedHospitalName,
        progress: 0, // Still waiting for acceptance
        timestamp: finalTimestamp,
      };
      setLiveCase(updatedCase);

      // Add to recent alerts
      const newAlert: Alert = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        alert: 'Emergency SOS',
        status: 'Pending',
        hospital: matchedHospitalName,
        id: incidentId,
      };
      setRecentAlerts(prev => [newAlert, ...prev]);

      // Note: Progress updates (Accepted, En Route) will now happen via polling
      // when the hospital actually accepts the case

    } catch (error) {
      console.error("Failed to send SOS alert:", error);
      alert(error instanceof Error ? error.message : 'Failed to send SOS alert. Please try again.');
      setLiveCase(null); // Clear the matching state on error
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