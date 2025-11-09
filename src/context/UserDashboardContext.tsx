"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  const { data: session } = useSession();
  const [sosModalOpen, setSOSModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertData, setAlertData] = useState<SOSAlertData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [liveCase, setLiveCase] = useState<LiveCase | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);

  const healthInfo: HealthInfo = {
    bloodType: '0+',
    allergies: 'None',
    conditions: 'Asthma',
    medication: 'Ventolin',
  };

  // Get user-specific localStorage key
  const getStorageKey = () => {
    if (!session?.user?.id) return null;
    return `recent-alerts-${session.user.id}`;
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

  // Load recent alerts from localStorage and database on mount
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadRecentAlerts = async () => {
      const storageKey = getStorageKey();
      
      if (storageKey) {
        try {
          // First try to load from localStorage (fast, user-specific)
          const savedAlerts = localStorage.getItem(storageKey);
          if (savedAlerts) {
            const alerts = JSON.parse(savedAlerts);
            setRecentAlerts(alerts);
            console.log(`📦 Loaded ${alerts.length} alerts from localStorage for user:`, session.user.id);
          }
        } catch (error) {
          console.log('No saved alerts found or error loading:', error);
        }
      }
      
      // Then fetch from API to sync with database (accurate, automatically filtered by user)
      try {
        const response = await fetch('/api/user/incidents');
        if (response.ok) {
          const incidents = await response.json();
          
          // Convert incidents to alert format
          const alertsFromDB: Alert[] = incidents.map((incident: any) => ({
            date: new Date(incident.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            alert: incident.description || incident.samaritanNotes || 'Emergency SOS',
            status: incident.status === 'RESOLVED' ? 'Resolved' 
                  : incident.status === 'EN_ROUTE' ? 'En Route'
                  : incident.status === 'ACCEPTED' ? 'Accepted'
                  : incident.status === 'CANCELLED' ? 'Cancelled'
                  : 'Pending',
            hospital: incident.facility?.name || 'Matching...',
            id: incident.id,
          }));
          
          // Update state and localStorage with synced data
          setRecentAlerts(alertsFromDB);
          console.log(`📡 Loaded ${alertsFromDB.length} alerts from API for user:`, session.user.id);
          
          if (alertsFromDB.length > 0 && storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(alertsFromDB));
          }
        }
      } catch (error) {
        console.error('Failed to fetch incidents from API:', error);
      }
    };
    
    loadRecentAlerts();
  }, [session?.user?.id]);

  // Save recent alerts to localStorage whenever they change (user-specific)
  useEffect(() => {
    if (recentAlerts.length > 0 && session?.user?.id) {
      const storageKey = getStorageKey();
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(recentAlerts));
          console.log(`💾 Saved ${recentAlerts.length} alerts for user:`, session.user.id);
        } catch (error) {
          console.error('Failed to save alerts:', error);
        }
      }
    }
  }, [recentAlerts, session?.user?.id]);

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

        // Update based on incident status (matching new schema statuses)
        if (incident.status === 'ACCEPTED' && liveCase.progress === 0) {
          // Hospital has accepted
          console.log('✅ Hospital accepted! Moving to Accepted state');
          setLiveCase(prev => prev ? { ...prev, progress: 1 } : null);
          
          // Update the alert status in recent alerts
          setRecentAlerts(prev => 
            prev.map(alert => 
              alert.id === liveCase.caseId 
                ? { ...alert, status: 'Accepted' }
                : alert
            )
          );
          console.log('✅ Updated recent alerts with Accepted status');
        } else if (incident.status === 'EN_ROUTE' && liveCase.progress === 1) {
          // Ambulance en route
          console.log('🚑 Ambulance dispatched! Moving to En Route state');
          setLiveCase(prev => prev ? { ...prev, progress: 2 } : null);
          
          // Update the alert status in recent alerts
          setRecentAlerts(prev => 
            prev.map(alert => 
              alert.id === liveCase.caseId 
                ? { ...alert, status: 'En Route' }
                : alert
            )
          );
          console.log('✅ Updated recent alerts with En Route status');
        } else if (incident.status === 'RESOLVED') {
          // Case completed
          console.log('✅ Case resolved! Moving to Completed state');
          setLiveCase(prev => prev ? { ...prev, progress: 3 } : null);
          
          // Update the alert status in recent alerts
          setRecentAlerts(prev => 
            prev.map(alert => 
              alert.id === liveCase.caseId 
                ? { ...alert, status: 'Resolved' }
                : alert
            )
          );
          console.log('✅ Updated recent alerts with Resolved status');
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
        incident: Incident & { publicId?: string; locationLat?: number; locationLng?: number }; 
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