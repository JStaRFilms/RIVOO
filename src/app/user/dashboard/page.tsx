"use client"
import React, { useState, useEffect } from 'react';
import { Menu, X, Mail, Bell, ChevronDown, AlertCircle, Phone, Settings, LogOut, Activity, User, Loader } from 'lucide-react';

// ==================== TYPES ====================
interface Alert {
  date: string;
  alert: string;
  status: 'Resolved' | 'Declined';
  hospital: string;
  id: string;
}

interface LiveCase {
  caseId: string;
  hospitalFound: boolean;
  hospital: string;
  progress: number;
  timestamp: string;
}

interface HealthInfo {
  bloodType: string;
  allergies: string;
  conditions: string;
  medication: string;
}

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// ==================== NAVIGATION COMPONENT ====================
const NavItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  active?: boolean; 
  onClick?: () => void 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors rounded-lg ${
      active 
        ? 'text-sea-green bg-sea-green/5 font-medium' 
        : 'text-prussian-blue hover:bg-seasalt'
    }`}
  >
    <Icon size={20} />
    <span className="text-sm">{label}</span>
  </button>
);

// ==================== STATUS COMPONENT ====================
const StatusItem = ({ 
  type, 
  message 
}: { 
  type: 'success' | 'warning'; 
  message: string 
}) => {
  const Icon = type === 'success' ? 
    <div className="w-5 h-5 rounded-full bg-sea-green flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div> 
    : 
    <div className="w-5 h-5 rounded-full bg-orange-peel flex items-center justify-center">
      <AlertCircle className="w-3 h-3 text-white" />
    </div>;

  return (
    <div className="flex items-center gap-3">
      {Icon}
      <span className={`text-sm ${type === 'success' ? 'text-prussian-blue' : 'text-slate-gray'}`}>
        {message}
      </span>
    </div>
  );
};

// ==================== PROGRESS BAR COMPONENT ====================
const ProgressBar = ({ step }: { step: number }) => {
  const steps = ['Matching', 'Accepted', 'En Route', 'In Care'];
  
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, index) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div 
              className={`w-3 h-3 rounded-full transition-all ${
                index <= step ? 'bg-sea-green' : 'bg-slate-gray/30'
              }`} 
            />
            <span 
              className={`text-xs mt-1 ${
                index <= step ? 'text-prussian-blue font-medium' : 'text-slate-gray'
              }`}
            >
              {label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`flex-1 h-0.5 mb-5 transition-all ${
                index < step ? 'bg-sea-green' : 'bg-slate-gray/30'
              }`} 
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ==================== ALERT ROW COMPONENT ====================
const AlertRow = ({ alert }: { alert: Alert }) => (
  <tr className="border-b border-seasalt hover:bg-seasalt/50 transition-colors">
    <td className="py-4 px-4 text-sm text-prussian-blue">{alert.date}</td>
    <td className="py-4 px-4 text-sm text-prussian-blue">{alert.alert}</td>
    <td className="py-4 px-4">
      <span 
        className={`text-sm font-medium ${
          alert.status === 'Resolved' ? 'text-sea-green' : 'text-fire-brick'
        }`}
      >
        {alert.status}
      </span>
    </td>
    <td className="py-4 px-4 text-sm text-prussian-blue">{alert.hospital}</td>
    <td className="py-4 px-4 text-sm text-slate-gray">{alert.id}</td>
  </tr>
);

// ==================== HEALTH INFO ROW COMPONENT ====================
const HealthInfoRow = ({ 
  label, 
  value 
}: { 
  label: string; 
  value: string 
}) => (
  <div className="flex justify-between items-center py-3 border-b border-seasalt last:border-0">
    <span className="text-sm text-slate-gray">{label}</span>
    <span className="text-sm text-prussian-blue font-medium">{value}</span>
  </div>
);

// ==================== SOS MODAL COMPONENT ====================
const SOSModal = ({ 
  isOpen, 
  onClose, 
  alertData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  alertData: any 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-sea-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sea-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-xl font-lato font-bold text-prussian-blue mb-2">
            SOS Alert Sent Successfully!
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-gray mb-6">
            Your emergency alert has been sent to nearby hospitals with your location and medical information.
          </p>
          
          {/* Alert Details */}
          <div className="bg-seasalt rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-gray">Case ID:</span>
                <span className="text-prussian-blue font-medium">{alertData.caseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-gray">Location:</span>
                <span className="text-prussian-blue font-medium">
                  {alertData.location 
                    ? `${alertData.location.latitude.toFixed(4)}, ${alertData.location.longitude.toFixed(4)}` 
                    : 'Acquiring...'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-gray">Time:</span>
                <span className="text-prussian-blue font-medium">{alertData.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-gray">Blood Type:</span>
                <span className="text-prussian-blue font-medium">{alertData.bloodType}</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-sea-green hover:bg-sea-green/90 text-white rounded-lg py-3 font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== REPORT MODAL COMPONENT ====================
const ReportModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    emergency: '',
    contact: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    setTimeout(() => {
      alert(`Emergency report submitted for ${formData.name}`);
      setSubmitting(false);
      onClose();
      setFormData({ name: '', location: '', emergency: '', contact: '' });
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-lato font-bold text-prussian-blue">
            Report Emergency for Another
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-gray hover:text-prussian-blue"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-gray mb-2">
              Person Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sea-green focus:border-transparent"
              placeholder="Enter name"
            />
          </div>
          
          {/* Location Field */}
          <div>
            <label className="block text-sm font-medium text-slate-gray mb-2">
              Location
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sea-green focus:border-transparent"
              placeholder="Enter location or address"
            />
          </div>
          
          {/* Emergency Type Field */}
          <div>
            <label className="block text-sm font-medium text-slate-gray mb-2">
              Type of Emergency
            </label>
            <select
              required
              value={formData.emergency}
              onChange={(e) => setFormData({...formData, emergency: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sea-green focus:border-transparent"
            >
              <option value="">Select emergency type</option>
              <option value="medical">Medical Emergency</option>
              <option value="accident">Accident</option>
              <option value="assault">Assault</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Contact Field */}
          <div>
            <label className="block text-sm font-medium text-slate-gray mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sea-green focus:border-transparent"
              placeholder="Enter contact number"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-prussian-blue rounded-lg font-medium hover:bg-seasalt transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-orange-peel hover:bg-orange-peel/90 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== SIDEBAR COMPONENT ====================
const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  currentView, 
  setCurrentView 
}: { 
  sidebarOpen: boolean; 
  setSidebarOpen: (open: boolean) => void; 
  currentView: string; 
  setCurrentView: (view: string) => void 
}) => {
  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-prussian-blue font-lato">ROVOO</h1>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-prussian-blue"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          <NavItem 
            icon={Activity} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />
          <NavItem 
            icon={User} 
            label="My Profile" 
            active={currentView === 'profile'} 
            onClick={() => setCurrentView('profile')} 
          />
          <NavItem 
            icon={AlertCircle} 
            label="SOS Card" 
            active={currentView === 'sos'} 
            onClick={() => setCurrentView('sos')} 
          />
          <NavItem 
            icon={Activity} 
            label="My Health" 
            active={currentView === 'health'} 
            onClick={() => setCurrentView('health')} 
          />
          <NavItem 
            icon={Phone} 
            label="Contact" 
            active={currentView === 'contact'} 
            onClick={() => setCurrentView('contact')} 
          />
          <NavItem 
            icon={Settings} 
            label="Settings" 
            active={currentView === 'settings'} 
            onClick={() => setCurrentView('settings')} 
          />
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sea-green/10 flex items-center justify-center">
              <span className="text-sm font-medium text-sea-green">BO</span>
            </div>
            <span className="text-sm font-medium text-prussian-blue">Busola Ola</span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-3">
          <button 
            onClick={() => alert('Logging out...')} 
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-gray hover:bg-seasalt rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

// ==================== HEADER COMPONENT ====================
const Header = ({ 
  setSidebarOpen, 
  setReportModalOpen, 
  handleSOSClick, 
  sendingAlert 
}: { 
  setSidebarOpen: (open: boolean) => void; 
  setReportModalOpen: (open: boolean) => void; 
  handleSOSClick: () => void; 
  sendingAlert: boolean 
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left Side - Date */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden text-prussian-blue"
          >
            <Menu size={24} />
          </button>
          <span className="text-sm text-slate-gray">Monday, 04 November 2025</span>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Report for Another Button */}
          <button 
            onClick={() => setReportModalOpen(true)} 
            className="flex items-center gap-2 px-4 lg:px-6 py-2.5 bg-orange-peel hover:bg-orange-peel/90 text-white rounded-lg font-lato font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Phone size={18} />
            <span className="hidden md:inline">Report</span>
          </button>

          {/* SOS Button */}
          <button 
            onClick={handleSOSClick} 
            disabled={sendingAlert} 
            className="flex items-center gap-2 px-4 lg:px-6 py-2.5 bg-fire-brick hover:bg-fire-brick/90 text-white rounded-lg font-lato font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingAlert ? (
              <>
                <Loader className="animate-spin" size={18} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>SOS</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </>
            )}
          </button>

          {/* User Profile & Notifications - Desktop Only */}
          <div className="hidden md:flex items-center gap-4">
            <button className="relative text-prussian-blue">
              <Mail size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-fire-brick rounded-full" />
            </button>
            <button className="relative text-prussian-blue">
              <Bell size={20} />
            </button>
            <button className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sea-green/10 flex items-center justify-center">
                <span className="text-xs font-medium text-sea-green">BO</span>
              </div>
              <span className="hidden lg:block text-sm font-medium text-prussian-blue">
                Busola Ola
              </span>
              <ChevronDown size={16} className="text-slate-gray" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
export default function RovooSafetyDashboard() {
  // State Management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sosModalOpen, setSOSModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertData, setAlertData] = useState<any>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [liveCase, setLiveCase] = useState<LiveCase | null>(null);
  
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([
    { date: 'Nov 3', alert: 'Breathing Issue', status: 'Resolved', hospital: 'Lagoon', id: 'RIV-054' },
    { date: 'Nov 3', alert: 'Road Injury', status: 'Declined', hospital: 'Lagoon', id: 'RIV-045' },
    { date: 'Nov 3', alert: 'Panic Attack', status: 'Resolved', hospital: 'Lagoon', id: 'RIV-009' },
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
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Generate Unique Case ID
  const generateCaseId = () => {
    return `RIV-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  };

  // Handle SOS Button Click
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
          sendSOSAlert(null);
        }
      );
    } else {
      sendSOSAlert(location);
    }
  };

  // Send SOS Alert
  const sendSOSAlert = (currentLocation: Location | null) => {
    const caseId = generateCaseId();
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const alert = {
      caseId,
      location: currentLocation,
      timestamp,
      bloodType: healthInfo.bloodType,
      conditions: healthInfo.conditions,
      allergies: healthInfo.allergies,
      medication: healthInfo.medication,
    };

    // Simulate sending alert
    setTimeout(() => {
      setAlertData(alert);
      setSendingAlert(false);
      setSOSModalOpen(true);

      // Create live case
      const newCase: LiveCase = {
        caseId,
        hospitalFound: false,
        hospital: 'Searching...',
        progress: 0,
        timestamp,
      };
      setLiveCase(newCase);

      // Simulate hospital matching
      setTimeout(() => {
        setLiveCase(prev => prev ? { 
          ...prev, 
          progress: 1, 
          hospitalFound: true, 
          hospital: 'Reddington' 
        } : null);
      }, 3000);

      setTimeout(() => {
        setLiveCase(prev => prev ? { ...prev, progress: 2 } : null);
      }, 6000);

      // Add to recent alerts
      const newAlert: Alert = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        alert: 'Emergency SOS',
        status: 'Resolved',
        hospital: 'Reddington',
        id: caseId,
      };
      setRecentAlerts(prev => [newAlert, ...prev]);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-seasalt font-roboto">
      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap');
        
        :root {
          --sea-green: #198754;
          --fire-brick: #c1121f;
          --prussian-blue: #003049;
          --slate-gray: #718096;
          --seasalt: #f8f9fa;
          --orange-peel: #ff9f0a;
          --blue-ncs: #0288d1;
        }
        
        .font-lato { font-family: 'Lato', sans-serif; }
        .font-roboto { font-family: 'Roboto', sans-serif; }
        .text-sea-green { color: var(--sea-green); }
        .bg-sea-green { background-color: var(--sea-green); }
        .text-fire-brick { color: var(--fire-brick); }
        .bg-fire-brick { background-color: var(--fire-brick); }
        .text-prussian-blue { color: var(--prussian-blue); }
        .bg-prussian-blue { background-color: var(--prussian-blue); }
        .text-slate-gray { color: var(--slate-gray); }
        .bg-slate-gray { background-color: var(--slate-gray); }
        .bg-seasalt { background-color: var(--seasalt); }
        .text-orange-peel { color: var(--orange-peel); }
        .bg-orange-peel { background-color: var(--orange-peel); }
        .text-blue-ncs { color: var(--blue-ncs); }
        .bg-blue-ncs { background-color: var(--blue-ncs); }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Modals */}
      <SOSModal 
        isOpen={sosModalOpen} 
        onClose={() => setSOSModalOpen(false)} 
        alertData={alertData} 
      />
      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
      />

      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <Header 
          setSidebarOpen={setSidebarOpen} 
          setReportModalOpen={setReportModalOpen} 
          handleSOSClick={handleSOSClick} 
          sendingAlert={sendingAlert} 
        />

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Greeting Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-sea-green/10 flex items-center justify-center">
              <span className="text-base font-medium text-sea-green">BO</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-lato font-bold text-prussian-blue">
              Hello, Busola. Are you safe today?
            </h2>
          </div>

          {/* Safety Status Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-lato font-bold text-prussian-blue mb-4">
              Safety Status
            </h3>
            <div className="space-y-3">
              <StatusItem 
                type={location ? "success" : "warning"} 
                message={location ? "Location enabled" : "Location disabled"} 
              />
              <StatusItem 
                type="success" 
                message="Medical profile updated" 
              />
              <StatusItem 
                type="warning" 
                message="1 emergency contact missing" 
              />
            </div>
          </div>

          {/* Report for Another - Mobile Button */}
          <button 
            onClick={() => setReportModalOpen(true)} 
            className="sm:hidden w-full bg-orange-peel hover:bg-orange-peel/90 text-white rounded-xl p-6 mb-6 flex items-center gap-4 transition-all shadow-sm hover:shadow-md"
          >
            <Phone className="w-8 h-8" />
            <span className="text-lg font-lato font-bold">Report for Another</span>
          </button>

          {/* Live Case Status Card */}
          {liveCase && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-sea-green">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-sea-green rounded-full animate-pulse" />
                <h3 className="text-lg font-lato font-bold text-prussian-blue">
                  Live Case Status
                </h3>
              </div>
              <p className="text-2xl font-lato font-bold text-prussian-blue mb-2">
                Case #{liveCase.caseId}
              </p>
              <p className="text-sm text-slate-gray mb-1">
                Hospital Found: {liveCase.hospitalFound ? 'Yes' : 'Searching...'}
              </p>
              <p className="text-sm text-prussian-blue font-medium mb-6">
                {liveCase.hospital}
              </p>
              <ProgressBar step={liveCase.progress} />
            </div>
          )}

          {/* Recent Alerts Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-lato font-bold text-prussian-blue">
                Recent Alerts
              </h3>
              <button className="text-sm text-sea-green font-medium hover:underline">
                View All
              </button>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-seasalt">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
                      Alert
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentAlerts.map((alert) => (
                    <AlertRow key={alert.id} alert={alert} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* My Health Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-lato font-bold text-prussian-blue mb-4">
              My Health
            </h3>
            <div className="space-y-0">
              <HealthInfoRow label="Blood Type" value={healthInfo.bloodType} />
              <HealthInfoRow label="Allergies" value={healthInfo.allergies} />
              <HealthInfoRow label="Conditions" value={healthInfo.conditions} />
              <HealthInfoRow label="Medication" value={healthInfo.medication} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}