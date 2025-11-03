'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HospitalLoginPage() {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate Staff ID format
    if (!staffId.match(/^HOSP-\d{5}$/)) {
      setError('Please enter a valid Staff ID (format: HOSP-XXXXX)');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        staffId,
        password,
      });

      if (result?.error) {
        setError('Invalid Staff ID or password');
        return;
      }

      router.push('/hospital/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full">
        {/* Logo and intro */}
        <div className="text-center mb-10">
          <div className="bg-hospital-primary w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-bold text-hospital-primary mb-2 font-heading">
            RIVOO Hospital Portal
          </h1>
          <p className="text-hospital-secondary">
            Secure access to emergency response management
          </p>

          <div className="mt-4 inline-flex items-center bg-blue-50 text-hospital-accent px-3 py-1 rounded-full text-xs font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
            </svg>
            HIPAA Compliant • Encrypted Connections
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="staffId" className="block text-sm font-medium text-hospital-primary mb-1.5">
                  Staff ID
                </label>
                <input
                  type="text"
                  id="staffId"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hospital-primary focus:border-hospital-primary"
                  placeholder="HOSP-XXXXX"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  required
                />
                {error && error.includes('Staff ID') && (
                  <div className="text-hospital-alert text-sm mt-1">{error}</div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-hospital-primary mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hospital-primary focus:border-hospital-primary"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && error.includes('Password') && (
                  <div className="text-hospital-alert text-sm mt-1">{error}</div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-hospital-primary rounded focus:ring-hospital-primary"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-hospital-secondary">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-hospital-primary hover:text-blue-900">
                  Forgot password?
                </a>
              </div>

              {error && !error.includes('Staff ID') && !error.includes('Password') && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-hospital-primary text-white rounded-xl font-medium text-lg hover:bg-blue-900 transition disabled:opacity-70"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Hospital Portal'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-hospital-secondary">
              Not a hospital staff member?{' '}
              <Link href="/auth/signin" className="font-medium text-hospital-primary hover:text-blue-900">
                Return to RIVOO User App
              </Link>
            </p>
          </div>
        </div>

        {/* Security Information */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-hospital-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-hospital-primary">Secure Access</h3>
                <p className="text-sm text-hospital-secondary">All connections are encrypted with TLS 1.3</p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-hospital-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-hospital-primary">HIPAA Compliant</h3>
                <p className="text-sm text-hospital-secondary">Patient data protected per healthcare regulations</p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-hospital-alert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-hospital-primary">24/7 Support</h3>
                <p className="text-sm text-hospital-secondary">Contact IT support for login assistance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-hospital-secondary">
            Authorized personnel only • This system is for emergency response coordination
          </p>
          <p className="mt-2 text-xs text-hospital-secondary">
            © 2023 RIVOO Emergency Response Network • Hospital Portal v2.3
          </p>
        </div>
      </div>
    </div>
  );
}
