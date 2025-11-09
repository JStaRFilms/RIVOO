'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  AlertCircle,
  Clock,
  Bed,
  Plus,
  Download,
  Eye,
  MapPin
} from 'lucide-react';

// Types
interface Incident {
  id: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  user?: {
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

type FilterTab = 'all' | 'new' | 'in_progress' | 'completed' | 'critical';

export default function HospitalDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchIncidents();
      const interval = setInterval(fetchIncidents, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents');
      if (response.ok) {
        const data = await response.json();
        // ✅ FIX: Handle the new response format
        const incidentsList = data.incidents || [];
        setIncidents(incidentsList);
        console.log(`Loaded ${incidentsList.length} incidents`);
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
      let response;
      
      if (newStatus === 'ASSIGNED') {
        response = await fetch(`/api/incidents/${incidentId}/accept`, {
          method: 'POST',
        });
      } else if (newStatus === 'IN_PROGRESS') {
        response = await fetch(`/api/incidents/${incidentId}/accept`, {
          method: 'PATCH',
        });
      } else {
        response = await fetch(`/api/incidents/${incidentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      if (response.ok) {
        fetchIncidents();
      } else {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.error || error.details || errorMessage;
        } catch (e) {
          errorMessage = `${response.status} ${response.statusText}`;
        }
        alert(`Failed to update: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Failed to update incident:', error);
      alert('Failed to update incident status');
    } finally {
      setUpdatingId(null);
    }
  };

  // ✅ FIX: Add safety check for incidents array
  const filteredIncidents = (incidents || []).filter(incident => {
    const matchesSearch = searchQuery === '' || 
      incident.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      activeFilter === 'all' ? incident.status !== 'RESOLVED' && incident.status !== 'CANCELLED' :
      activeFilter === 'new' ? incident.status === 'PENDING' :
      activeFilter === 'in_progress' ? incident.status === 'IN_PROGRESS' || incident.status === 'ASSIGNED' :
      activeFilter === 'completed' ? incident.status === 'RESOLVED' :
      activeFilter === 'critical' ? incident.priority === 'CRITICAL' && incident.status !== 'RESOLVED' && incident.status !== 'CANCELLED' : true;

    return matchesSearch && matchesFilter;
  });

  // Statistics - with safety checks
  const stats = {
    total: (incidents || []).filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED').length,
    critical: (incidents || []).filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length,
    pending: (incidents || []).filter(i => i.status === 'PENDING').length,
    inProgress: (incidents || []).filter(i => i.status === 'IN_PROGRESS').length,
  };

  // Group by priority
  const criticalAlerts = filteredIncidents.filter(i => i.priority === 'CRITICAL');
  const urgentAlerts = filteredIncidents.filter(i => i.priority === 'HIGH');
  const standardAlerts = filteredIncidents.filter(i => i.priority === 'MEDIUM' || i.priority === 'LOW');

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <Header 
          session={session} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <StatsCard 
              title="Total Alerts Today"
              value={stats.total}
              icon={<AlertCircle className="w-6 h-6" />}
              bgColor="bg-teal-50"
              iconColor="text-teal-600"
            />
            <StatsCard 
              title="Critical Alerts"
              value={stats.critical}
              icon={<AlertCircle className="w-6 h-6" />}
              bgColor="bg-red-50"
              iconColor="text-red-600"
            />
            <StatsCard 
              title="Average Response Time"
              value="7m 23s"
              icon={<Clock className="w-6 h-6" />}
              bgColor="bg-green-50"
              iconColor="text-green-600"
            />
            <StatsCard 
              title="Available Beds"
              value="8"
              icon={<Bed className="w-6 h-6" />}
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
          </div>

          {/* Filter Tabs & Actions */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <FilterButton 
                  label="All Alerts" 
                  active={activeFilter === 'all'} 
                  onClick={() => setActiveFilter('all')} 
                />
                <FilterButton 
                  label="New" 
                  active={activeFilter === 'new'} 
                  onClick={() => setActiveFilter('new')}
                  badge={stats.pending}
                />
                <FilterButton 
                  label="In Progress" 
                  active={activeFilter === 'in_progress'} 
                  onClick={() => setActiveFilter('in_progress')} 
                />
                <FilterButton 
                  label="Completed" 
                  active={activeFilter === 'completed'} 
                  onClick={() => setActiveFilter('completed')} 
                />
                <FilterButton 
                  label="Critical Only" 
                  active={activeFilter === 'critical'} 
                  onClick={() => setActiveFilter('critical')}
                  badge={stats.critical}
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Case</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Alert Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <AlertColumn
              title="Critical Alerts"
              count={criticalAlerts.length}
              color="red"
              incidents={criticalAlerts}
              updateIncidentStatus={updateIncidentStatus}
              updatingId={updatingId}
            />
            <AlertColumn
              title="Urgent Alerts"
              count={urgentAlerts.length}
              color="yellow"
              incidents={urgentAlerts}
              updateIncidentStatus={updateIncidentStatus}
              updatingId={updatingId}
            />
            <AlertColumn
              title="Standard Alerts"
              count={standardAlerts.length}
              color="blue"
              incidents={standardAlerts}
              updateIncidentStatus={updateIncidentStatus}
              updatingId={updatingId}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Modular Components

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20 hidden" id="sidebar-backdrop"></div>
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#003049] text-white z-30 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} hidden lg:block`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#003049] font-bold text-xl">A</span>
            </div>
            {!collapsed && <h1 className="text-xl font-bold">Aura Hospital</h1>}
          </div>

          <nav className="space-y-2">
            <NavItem icon={<Home className="w-5 h-5" />} label="Alert Dashboard" active={true} collapsed={collapsed} />
            <NavItem icon={<FileText className="w-5 h-5" />} label="Active Cases" collapsed={collapsed} />
            <NavItem icon={<Users className="w-5 h-5" />} label="Patients" collapsed={collapsed} />
            <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Analytics" collapsed={collapsed} />
            <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" collapsed={collapsed} />
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 p-3 bg-white bg-opacity-10 rounded-lg">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-sm font-medium">
              DR
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Dr. Rodriguez</p>
                <p className="text-xs text-gray-300 truncate">ER Lead Physician</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon, label, active = false, collapsed }: { icon: React.ReactNode; label: string; active?: boolean; collapsed: boolean }) {
  return (
    <a 
      href="#" 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active ? 'bg-white text-[#003049]' : 'text-white hover:bg-white hover:bg-opacity-10'
      }`}
    >
      {icon}
      {!collapsed && <span className="font-medium">{label}</span>}
    </a>
  );
}

function Header({ session, searchQuery, setSearchQuery }: { session: any; searchQuery: string; setSearchQuery: (q: string) => void }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-xl lg:text-2xl font-bold text-[#003049] mb-1">Emergency Response Dashboard</h1>
          <p className="text-sm text-gray-600">Today's active cases and critical alerts</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-48"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden lg:block font-medium text-gray-700 text-sm">
              {session?.user?.name || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatsCard({ title, value, icon, bgColor, iconColor }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  bgColor: string; 
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-[#003049]">{value}</p>
        </div>
        <div className={`${bgColor} ${iconColor} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick, badge }: { 
  label: string; 
  active: boolean; 
  onClick: () => void; 
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-[#003049] text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-white text-[#003049]' : 'bg-gray-300'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function AlertColumn({ title, count, color, incidents, updateIncidentStatus, updatingId }: {
  title: string;
  count: number;
  color: 'red' | 'yellow' | 'blue';
  incidents: Incident[];
  updateIncidentStatus: (id: string, status: string) => void;
  updatingId: string | null;
}) {
  const colorClasses = {
    red: { bg: 'bg-red-600', dot: 'bg-red-600', border: 'border-l-red-600' },
    yellow: { bg: 'bg-yellow-500', dot: 'bg-yellow-500', border: 'border-l-yellow-500' },
    blue: { bg: 'bg-blue-600', dot: 'bg-blue-600', border: 'border-l-blue-600' },
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${colorClasses[color].dot} ${color === 'red' ? 'animate-pulse' : ''}`}></div>
        <h2 className="text-lg font-bold text-[#003049]">{title}</h2>
        <span className="text-sm text-gray-500">({count})</span>
      </div>

      <div className="space-y-4">
        {incidents.length > 0 ? (
          incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              borderColor={colorClasses[color].border}
              updateIncidentStatus={updateIncidentStatus}
              updatingId={updatingId}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500 text-sm">
            No {title.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );
}

function IncidentCard({ incident, borderColor, updateIncidentStatus, updatingId }: {
  incident: Incident;
  borderColor: string;
  updateIncidentStatus: (id: string, status: string) => void;
  updatingId: string | null;
}) {
  const getNextAction = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Accept', status: 'ASSIGNED', color: 'bg-red-600 hover:bg-red-700' };
      case 'ASSIGNED': return { label: 'Dispatch', status: 'IN_PROGRESS', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'IN_PROGRESS': return { label: 'Complete', status: 'RESOLVED', color: 'bg-green-600 hover:bg-green-700' };
      default: return null;
    }
  };

  const nextAction = getNextAction(incident.status);
  const isUpdating = updatingId === incident.id;
  const timeAgo = getTimeAgo(incident.createdAt);

  return (
    <div className={`bg-white border-l-4 ${borderColor} rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">#{incident.id.slice(-6).toUpperCase()}</h3>
          <p className="text-xs text-gray-500">Received: {timeAgo} • ETA: 7 min</p>
        </div>
        <StatusBadge status={incident.status} />
      </div>

      {/* Location & Patient */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <p className="text-xs text-gray-500 mb-1">Location</p>
          <p className="font-medium text-gray-900 truncate text-xs">
            {incident.address || `${incident.locationLat.toFixed(2)}, ${incident.locationLng.toFixed(2)}`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Patient</p>
          <p className="font-medium text-gray-900 truncate text-xs">
            {incident.user?.name || incident.user?.email || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Condition */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Condition</p>
        <p className="font-medium text-gray-900 text-sm">{incident.description || 'Emergency SOS Alert'}</p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        {nextAction && (
          <button
            onClick={() => updateIncidentStatus(incident.id, nextAction.status)}
            disabled={isUpdating}
            className={`${nextAction.color} text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50`}
          >
            {isUpdating ? 'Updating...' : nextAction.label}
          </button>
        )}
        <button className="border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
          <Eye className="w-4 h-4" />
          Details
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.PENDING}`}>
      {status === 'PENDING' ? 'NEW' : status.replace('_', ' ')}
    </span>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString();
}