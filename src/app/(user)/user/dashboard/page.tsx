'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Incident {
  id: string;
  status: string;
  createdAt: string;
  locationLat: number;
  locationLng: number;
  address?: string;
  description?: string;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    patientName: '',
    condition: '',
    details: '',
    shareLocation: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSOS = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/alert/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sos',
          location: await getCurrentLocation(),
        }),
      });

      if (response.ok) {
        const incident = await response.json();
        setCurrentIncident(incident);
      }
    } catch (error) {
      console.error('Failed to create SOS alert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/alert/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report',
          patientName: reportData.patientName,
          condition: reportData.condition,
          details: reportData.details,
          location: reportData.shareLocation ? await getCurrentLocation() : null,
        }),
      });

      if (response.ok) {
        const incident = await response.json();
        setCurrentIncident(incident);
        setShowReportForm(false);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number; address?: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const cancelEmergency = () => {
    setCurrentIncident(null);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-user-bg">
        <div className="text-user-text">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="bg-user-bg font-sans min-h-screen">
      {/* Main Dashboard */}
      {!currentIncident && !showReportForm && (
        <div className="h-screen flex flex-col">
          {/* Top Bar */}
          <div className="pt-4 px-4">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 bg-user-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                R
              </div>
              <div className="text-xs text-user-secondary font-medium">RIVOO Emergency</div>
              <div className="w-8 h-8"></div>
            </div>
          </div>

          {/* SOS Button */}
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <button
              onClick={handleSOS}
              disabled={isLoading}
              className="sos-button bg-user-emergency text-white font-bold text-3xl rounded-3xl flex items-center justify-center animate-pulse-emergency shadow-2xl focus:outline-none active:scale-95 transition-transform disabled:opacity-70"
              style={{
                height: '40vh',
                minHeight: '200px',
                maxHeight: '350px',
                width: '80vw',
                maxWidth: '400px',
              }}
            >
              {isLoading ? '...' : 'SOS'}
            </button>
          </div>

          {/* Report for Another */}
          <div className="pb-8 px-6">
            <button
              onClick={() => setShowReportForm(true)}
              className="w-full py-4 bg-user-primary text-white rounded-2xl font-medium text-lg hover:bg-green-600 transition"
            >
              Report for Another Person
            </button>
          </div>
        </div>
      )}

      {/* Emergency Active State */}
      {currentIncident && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Status Header */}
          <div className="bg-user-emergency text-white px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Emergency Active</h1>
                <p className="opacity-90">Help is on the way</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">--:--</div>
                <div className="text-xs opacity-80">Response Time</div>
              </div>
            </div>
          </div>

          {/* Critical Information */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-user-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <p className="text-lg font-medium text-user-text">Your location has been shared</p>
              <p className="text-user-secondary mt-2">
                {currentIncident.address || `${currentIncident.locationLat.toFixed(4)}, ${currentIncident.locationLng.toFixed(4)}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-medium text-user-text capitalize">{currentIncident.status.replace('_', ' ')}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Reported</p>
                <p className="font-medium text-user-text">
                  {new Date(currentIncident.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-8">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={cancelEmergency}
                className="py-4 bg-gray-100 text-user-text rounded-xl font-medium"
              >
                Cancel
              </button>
              <button className="py-4 bg-user-primary text-white rounded-xl font-medium">
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report for Another Screen */}
      {showReportForm && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="bg-white px-6 py-4 border-b">
            <div className="flex items-center">
              <button
                onClick={() => setShowReportForm(false)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6 text-user-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </button>
              <h1 className="text-xl font-bold text-user-text">Report for Another</h1>
            </div>
          </div>

          <form onSubmit={handleReportSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-user-text mb-2">Patient Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-user-primary focus:border-user-primary"
                placeholder="Full name"
                value={reportData.patientName}
                onChange={(e) => setReportData(prev => ({ ...prev, patientName: e.target.value }))}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-user-text mb-2">Medical Condition</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-user-primary focus:border-user-primary"
                value={reportData.condition}
                onChange={(e) => setReportData(prev => ({ ...prev, condition: e.target.value }))}
                required
              >
                <option value="">Select condition</option>
                <option value="chest_pain">Chest Pain</option>
                <option value="difficulty_breathing">Difficulty Breathing</option>
                <option value="severe_bleeding">Severe Bleeding</option>
                <option value="unconscious">Unconscious</option>
                <option value="other">Other Emergency</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-user-text mb-2">Additional Details</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-user-primary focus:border-user-primary"
                placeholder="Describe what's happening..."
                value={reportData.details}
                onChange={(e) => setReportData(prev => ({ ...prev, details: e.target.value }))}
              />
            </div>

            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="shareLocation"
                className="h-5 w-5 text-user-primary rounded focus:ring-user-primary"
                checked={reportData.shareLocation}
                onChange={(e) => setReportData(prev => ({ ...prev, shareLocation: e.target.checked }))}
              />
              <label htmlFor="shareLocation" className="ml-3 text-user-text font-medium">
                Share my current location
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-user-primary text-white rounded-xl font-medium text-lg disabled:opacity-70"
            >
              {isLoading ? 'Sending...' : 'Send Emergency Alert'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
