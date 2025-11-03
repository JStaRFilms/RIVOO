'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-user-bg to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo and Title */}
        <div className="mb-12">
          <div className="bg-user-primary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">R</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-user-text mb-4 font-heading">
            RIVOO
          </h1>
          <p className="text-xl md:text-2xl text-user-secondary mb-2">
            The Emergency Response Network
          </p>
          <p className="text-lg text-user-secondary max-w-2xl mx-auto">
            Your safety is just one tap away. Connect with emergency services instantly when you need help most.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-3xl mx-auto">
          {/* User Portal */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-user-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-user-text mb-2">User Portal</h3>
            <p className="text-user-secondary mb-6">
              Access emergency services, manage your profile, and get help when you need it most.
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full py-3 px-6 bg-user-primary text-white rounded-xl font-medium hover:bg-green-600 transition"
              >
                Sign In as User
              </Link>
              <Link
                href="/user/dashboard"
                className="block w-full py-3 px-6 border border-user-primary text-user-primary rounded-xl font-medium hover:bg-green-50 transition"
              >
                View User Dashboard
              </Link>
            </div>
          </div>

          {/* Hospital Portal */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-hospital-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-hospital-primary mb-2">Hospital Portal</h3>
            <p className="text-user-secondary mb-6">
              Manage emergency responses, coordinate with teams, and provide critical care services.
            </p>
            <div className="space-y-3">
              <Link
                href="/hospital/login"
                className="block w-full py-3 px-6 bg-hospital-primary text-white rounded-xl font-medium hover:bg-blue-700 transition"
              >
                Hospital Staff Login
              </Link>
              <Link
                href="/hospital/dashboard"
                className="block w-full py-3 px-6 border border-hospital-primary text-hospital-primary rounded-xl font-medium hover:bg-blue-50 transition"
              >
                View Hospital Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-user-text mb-6 font-heading">Emergency Response Features</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="text-center">
              <div className="bg-user-emergency w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 className="font-bold text-user-text mb-2">One-Tap SOS</h4>
              <p className="text-sm text-user-secondary">Instant emergency alerts with automatic location sharing</p>
            </div>
            <div className="text-center">
              <div className="bg-user-info w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h4 className="font-bold text-user-text mb-2">Real-time Location</h4>
              <p className="text-sm text-user-secondary">GPS tracking ensures help arrives at the right place</p>
            </div>
            <div className="text-center">
              <div className="bg-hospital-success w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h4 className="font-bold text-user-text mb-2">Hospital Coordination</h4>
              <p className="text-sm text-user-secondary">Seamless communication between users and medical facilities</p>
            </div>
          </div>
        </div>

        {/* Available Routes */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-user-text mb-4">Available Routes</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left text-sm">
            <div>
              <h4 className="font-semibold text-user-text mb-2">Authentication</h4>
              <ul className="space-y-1 text-user-secondary">
                <li><code className="bg-gray-100 px-2 py-1 rounded">/auth/signin</code> - Combined login/signup</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/auth/signup</code> - Redirects to signin</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-user-text mb-2">User Portal</h4>
              <ul className="space-y-1 text-user-secondary">
                <li><code className="bg-gray-100 px-2 py-1 rounded">/user/dashboard</code> - Emergency dashboard</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/user/profile</code> - User profile (planned)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-user-text mb-2">Hospital Portal</h4>
              <ul className="space-y-1 text-user-secondary">
                <li><code className="bg-gray-100 px-2 py-1 rounded">/hospital/login</code> - Hospital staff login</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/hospital/dashboard</code> - Incident management</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/hospital/incidents</code> - Incident details (planned)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-user-text mb-2">API Endpoints</h4>
              <ul className="space-y-1 text-user-secondary">
                <li><code className="bg-gray-100 px-2 py-1 rounded">/api/alert/create</code> - Create emergency</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/api/incidents</code> - List incidents</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/api/incidents/[id]</code> - Update incident</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-user-secondary">
          <p className="text-sm">
            RIVOO Emergency Response Network - Built for safety, designed for speed
          </p>
        </div>
      </div>
    </div>
  );
}
