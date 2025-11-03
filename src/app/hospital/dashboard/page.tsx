'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Incident {
  id: string;
  status: string;
  priority: string;
  user: {
    name?: string;
    email: string;
  };
  locationLat: number;
  locationLng: number;
  address?: string;
  description?: string;
  notes?: string;
  createdAt: string;
}

export default function HospitalDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchIncidents();
    }
  }, [session]);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents');
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchIncidents(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update incident:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hospital-bg">
        <div className="text-hospital-text">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const criticalIncidents = incidents.filter(i => i.priority === 'CRITICAL');
  const urgentIncidents = incidents.filter(i => i.priority === 'HIGH');
  const standardIncidents = incidents.filter(i => i.priority === 'MEDIUM' || i.priority === 'LOW');

  return (
    <div className="min-h-screen bg-hospital-bg font-sans">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-hospital-primary min-h-screen p-4">
          <div className="flex items-center mb-8">
            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <span className="text-hospital-primary font-bold text-xl">R</span>
            </div>
            <h1 className="text-xl font-bold text-white font-heading">RIVOO Hospital</h1>
          </div>

          <ul className="space-y-1">
            <li className="px-3 py-2.5 bg-white text-hospital-primary rounded-lg font-medium flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Alert Dashboard
            </li>
            <li className="px-3 py-2.5 text-white hover:bg-blue-800 rounded-lg font-medium flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Active Cases
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-hospital-primary font-heading">Emergency Response Dashboard</h1>
              <p className="text-sm text-gray-600">Today's active cases and critical alerts</p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-hospital-accent rounded-full flex items-center justify-center text-white font-medium mr-2">
                {session.user?.name?.charAt(0) || 'U'}
              </div>
              <span className="font-medium text-gray-700">{session.user?.name || 'User'}</span>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Alerts Today</p>
                    <p className="text-2xl font-bold text-hospital-primary">{incidents.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-hospital-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Critical Alerts</p>
                    <p className="text-2xl font-bold text-hospital-alert">{criticalIncidents.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-hospital-alert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Average Response Time</p>
                    <p className="text-2xl font-bold text-hospital-primary">--:--</p>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-hospital-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Available Beds</p>
                    <p className="text-2xl font-bold text-hospital-primary">--</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-user-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Critical Alerts */}
              <div>
                <h2 className="text-lg font-bold text-hospital-primary flex items-center mb-4">
                  <span className="w-3 h-3 bg-hospital-alert rounded-full mr-2"></span>
                  Critical Alerts ({criticalIncidents.length})
                </h2>
                <div className="space-y-4">
                  {criticalIncidents.map((incident) => (
                    <div key={incident.id} className="bg-white border-l-4 border-l-hospital-alert border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-hospital-primary">Alert #{incident.id.slice(-4)}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(incident.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          {incident.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium">
                            {incident.address || `${incident.locationLat.toFixed(2)}, ${incident.locationLng.toFixed(2)}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Patient</p>
                          <p className="font-medium">{incident.user.name || incident.user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateIncidentStatus(incident.id, 'ASSIGNED')}
                          className="py-2 bg-hospital-alert text-white rounded-md text-sm font-medium"
                        >
                          Accept
                        </button>
                        <button className="py-2 border border-hospital-primary text-hospital-primary rounded-md text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Urgent Alerts */}
              <div>
                <h2 className="text-lg font-bold text-hospital-primary flex items-center mb-4">
                  <span className="w-3 h-3 bg-user-warning rounded-full mr-2"></span>
                  Urgent Alerts ({urgentIncidents.length})
                </h2>
                <div className="space-y-4">
                  {urgentIncidents.map((incident) => (
                    <div key={incident.id} className="bg-white border-l-4 border-l-user-warning border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-hospital-primary">Alert #{incident.id.slice(-4)}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(incident.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {incident.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium">
                            {incident.address || `${incident.locationLat.toFixed(2)}, ${incident.locationLng.toFixed(2)}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Patient</p>
                          <p className="font-medium">{incident.user.name || incident.user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateIncidentStatus(incident.id, 'IN_PROGRESS')}
                          className="py-2 bg-hospital-primary text-white rounded-md text-sm font-medium"
                        >
                          Update
                        </button>
                        <button className="py-2 border border-hospital-primary text-hospital-primary rounded-md text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standard Alerts */}
              <div>
                <h2 className="text-lg font-bold text-hospital-primary flex items-center mb-4">
                  <span className="w-3 h-3 bg-hospital-accent rounded-full mr-2"></span>
                  Standard Alerts ({standardIncidents.length})
                </h2>
                <div className="space-y-4">
                  {standardIncidents.map((incident) => (
                    <div key={incident.id} className="bg-white border-l-4 border-l-hospital-accent border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-hospital-primary">Alert #{incident.id.slice(-4)}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(incident.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {incident.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium">
                            {incident.address || `${incident.locationLat.toFixed(2)}, ${incident.locationLng.toFixed(2)}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Patient</p>
                          <p className="font-medium">{incident.user.name || incident.user.email}</p>
                        </div>
                      </div>

                      <button className="w-full py-2 border border-hospital-primary text-hospital-primary rounded-md text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
