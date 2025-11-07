'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Incident {
  id: string;
  status: string;
  priority: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  facility?: {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  locationLat: number;
  locationLng: number;
  address?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  acceptedAt?: string;
  resolvedAt?: string;
}

export default function HospitalDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchIncidents();
      
      // Set up polling for real-time updates
      const interval = setInterval(fetchIncidents, 5000); // Poll every 5 seconds
      
      return () => clearInterval(interval);
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
    setUpdatingId(incidentId);
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchIncidents(); // Refresh the list
      } else {
        alert('Failed to update incident status');
      }
    } catch (error) {
      console.error('Failed to update incident:', error);
      alert('Failed to update incident status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Filter incidents by priority
  const criticalIncidents = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CANCELLED');
  const urgentIncidents = incidents.filter(i => i.priority === 'HIGH' && i.status !== 'RESOLVED' && i.status !== 'CANCELLED');
  const standardIncidents = incidents.filter(i => (i.priority === 'MEDIUM' || i.priority === 'LOW') && i.status !== 'RESOLVED' && i.status !== 'CANCELLED');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING': return { status: 'ASSIGNED', label: 'Accept' };
      case 'ASSIGNED': return { status: 'IN_PROGRESS', label: 'Dispatch' };
      case 'IN_PROGRESS': return { status: 'RESOLVED', label: 'Complete' };
      default: return null;
    }
  };

  const renderIncidentCard = (incident: Incident, borderColor: string) => {
    const nextStatus = getNextStatus(incident.status);
    const isUpdating = updatingId === incident.id;
    
    return (
      <div key={incident.id} className={`bg-white border-l-4 ${borderColor} border border-gray-200 rounded-xl p-4 transition-all hover:shadow-md`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-900">Alert #{incident.id.slice(-6).toUpperCase()}</h3>
            <p className="text-xs text-gray-500">
              {new Date(incident.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(incident.status)}`}>
            {incident.status}
          </span>
        </div>

        <div className="space-y-2 mb-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Description</p>
            <p className="font-medium">{incident.description || 'Emergency SOS Alert'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium text-xs">
                {incident.address || `${incident.locationLat.toFixed(4)}, ${incident.locationLng.toFixed(4)}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Patient</p>
              <p className="font-medium text-xs truncate">{incident.user.name || incident.user.email}</p>
            </div>
          </div>
          
          {incident.facility && (
            <div>
              <p className="text-xs text-gray-500">Assigned To</p>
              <p className="font-medium text-xs">{incident.facility.name}</p>
            </div>
          )}
          
          {incident.notes && (
            <div>
              <p className="text-xs text-gray-500">Notes</p>
              <p className="text-xs">{incident.notes}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {nextStatus && (
            <button
              onClick={() => updateIncidentStatus(incident.id, nextStatus.status)}
              disabled={isUpdating}
              className={`py-2 ${
                nextStatus.status === 'ASSIGNED' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : nextStatus.status === 'IN_PROGRESS'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {isUpdating ? 'Updating...' : nextStatus.label}
            </button>
          )}
          <button 
            onClick={() => {
              const url = `https://www.google.com/maps?q=${incident.locationLat},${incident.locationLng}`;
              window.open(url, '_blank');
            }}
            className="py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium transition-colors"
          >
            View Map
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-blue-900 min-h-screen p-4">
          <div className="flex items-center mb-8">
            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-900 font-bold text-xl">R</span>
            </div>
            <h1 className="text-xl font-bold text-white">RIVOO Hospital</h1>
          </div>

          <ul className="space-y-1">
            <li className="px-3 py-2.5 bg-white text-blue-900 rounded-lg font-medium flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Alert Dashboard
            </li>
            <li className="px-3 py-2.5 text-white hover:bg-blue-800 rounded-lg font-medium flex items-center cursor-pointer">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
              <h1 className="text-xl font-bold text-blue-900">Emergency Response Dashboard</h1>
              <p className="text-sm text-gray-600">Real-time monitoring of emergency cases</p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-2">
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
                    <p className="text-sm text-gray-500 mb-1">Total Active Alerts</p>
                    <p className="text-2xl font-bold text-blue-900">{criticalIncidents.length + urgentIncidents.length + standardIncidents.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Critical Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{criticalIncidents.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pending Acceptance</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {incidents.filter(i => i.status === 'PENDING').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">In Progress</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {incidents.filter(i => i.status === 'IN_PROGRESS').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Critical Alerts */}
              <div>
                <h2 className="text-lg font-bold text-blue-900 flex items-center mb-4">
                  <span className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                  Critical Alerts ({criticalIncidents.length})
                </h2>
                <div className="space-y-4">
                  {criticalIncidents.length > 0 ? (
                    criticalIncidents.map((incident) => renderIncidentCard(incident, 'border-l-red-600'))
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
                      No critical alerts
                    </div>
                  )}
                </div>
              </div>

              {/* Urgent Alerts */}
              <div>
                <h2 className="text-lg font-bold text-blue-900 flex items-center mb-4">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  Urgent Alerts ({urgentIncidents.length})
                </h2>
                <div className="space-y-4">
                  {urgentIncidents.length > 0 ? (
                    urgentIncidents.map((incident) => renderIncidentCard(incident, 'border-l-yellow-500'))
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
                      No urgent alerts
                    </div>
                  )}
                </div>
              </div>

              {/* Standard Alerts */}
              <div>
                <h2 className="text-lg font-bold text-blue-900 flex items-center mb-4">
                  <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                  Standard Alerts ({standardIncidents.length})
                </h2>
                <div className="space-y-4">
                  {standardIncidents.length > 0 ? (
                    standardIncidents.map((incident) => renderIncidentCard(incident, 'border-l-blue-600'))
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
                      No standard alerts
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}