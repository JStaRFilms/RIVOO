'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Separate component that uses useSearchParams
function AuthPageContent() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const searchParams = useSearchParams();
  const [signinData, setSigninData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    firstName: '', lastName: '', email: '', password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    }
  }, [searchParams]);

  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: signinData.email,
        password: signinData.password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/user/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${signupData.firstName} ${signupData.lastName}`,
          email: signupData.email,
          password: signupData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      setActiveTab('signin');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container flex items-center py-12 px-4 sm:px-6 lg:px-8 bg-user-bg">
      <div className="form-card mx-auto max-w-2xl">
        {/* Logo and intro */}
        <div className="text-center mb-10">
          <div className="bg-user-primary w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-bold text-user-text mb-2 font-heading">RIVOO Emergency</h1>
          <p className="text-user-secondary">Your safety is just one tap away</p>
        </div>

        {/* Tabs */}
        <div className="bg-white text-black rounded-2xl shadow-sm overflow-hidden mb-8 border border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('signin')}
              className={`w-1/2 py-4 font-medium ${
                activeTab === 'signin'
                  ? 'text-user-text border-b-2 border-user-primary'
                  : 'text-user-secondary hover:text-user-text'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`w-1/2 py-4 font-medium ${
                activeTab === 'signup'
                  ? 'text-user-text border-b-2 border-user-primary'
                  : 'text-user-secondary hover:text-user-text'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <form onSubmit={handleSigninSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="loginEmail" className="block text-sm font-medium text-user-text mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="loginEmail"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-user-primary focus:border-user-primary"
                    placeholder="you@example.com"
                    value={signinData.email}
                    onChange={(e) => setSigninData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="loginPassword" className="block text-sm font-medium text-user-text mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    id="loginPassword"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-user-primary focus:border-user-primary"
                    placeholder="••••••••"
                    value={signinData.password}
                    onChange={(e) => setSigninData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-user-primary rounded focus:ring-user-primary"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-user-secondary">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm font-medium text-user-primary hover:text-green-700">
                    Forgot password?
                  </a>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="shrink-0">
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
                  className="w-full py-4 bg-user-primary text-white rounded-xl font-medium text-lg hover:bg-green-600 transition disabled:opacity-70"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-user-secondary">
                Don't have an account?{' '}
                <button
                  onClick={() => setActiveTab('signup')}
                  className="font-medium text-user-primary hover:text-green-700"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <form onSubmit={handleSignupSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-user-text mb-1.5">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-user-primary focus:border-user-primary"
                      placeholder="John"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-user-text mb-1.5">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-user-primary focus:border-user-primary"
                      placeholder="Smith"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signupEmail" className="block text-sm font-medium text-user-text mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="signupEmail"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-user-primary focus:border-user-primary"
                    placeholder="you@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="signupPassword" className="block text-sm font-medium text-user-text mb-1.5">
                    Create password
                  </label>
                  <input
                    type="password"
                    id="signupPassword"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-user-primary focus:border-user-primary"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <p className="mt-1 text-xs text-user-secondary">
                    Use 8 or more characters with a mix of letters, numbers & symbols
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex">
                    <div className="shrink-0">
                      <svg className="h-5 text-user-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-user-text">Your information is secure</p>
                      <p className="text-sm text-user-secondary">
                        We encrypt your data and only share it during emergencies
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="shrink-0">
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
                  className="w-full py-4 bg-user-primary text-white rounded-xl font-medium text-lg hover:bg-green-600 transition disabled:opacity-70"
                >
                  {isLoading ? 'Creating Account...' : 'Create Free Account'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-user-secondary">
                Already have an account?{' '}
                <button
                  onClick={() => setActiveTab('signin')}
                  className="font-medium text-user-primary hover:text-green-700"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Social Login (Future) */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="mb-4 text-center">
            <span className="text-xs font-medium text-user-secondary uppercase tracking-wider">Coming Soon</span>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-user-text hover:bg-gray-50 transition">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.73-.06-1.44-.16-2.13H12v4.05h5.53c-.22 1.15-.84 2.13-1.73 2.81v2.72h2.78c1.63-1.5 2.58-3.71 2.58-6.32z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-1 7.09-2.71l-3.3-2.58c-.97.66-2.21 1.04-3.79 1.04-2.9 0-5.31-1.96-6.19-4.63H2.23v2.84C4.07 20.03 7.66 23 12 23z" fill="#34A853"/>
                <path d="M5.81 14.42c-.18-.55-.28-1.13-.28-1.73 0-.6.1-1.18.28-1.73V8.1H2.23A9.98 9.98 0 0 0 3 12c0 1.55.5 2.98 1.37 4.1l3.44-2.67z" fill="#FBBC05"/>
                <path d="M12 5.2c1.63 0 3.07.56 4.18 1.66l3.13-3.13C17.32 2.2 14.88 1 12 1 7.66 1 3.86 3.97 2.23 8.1l3.58 2.72c.88-2.67 3.29-4.63 6.19-4.63z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-user-text hover:bg-gray-50 transition">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-user-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <span className="text-xs text-user-secondary">Secure Data</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-user-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <span className="text-xs text-user-secondary">Fast Response</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-user-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="text-xs text-user-secondary">24/7 Support</span>
            </div>
          </div>
          <p className="text-xs text-user-secondary">
            By signing up, you agree to our{' '}
            <a href="#" className="text-user-primary hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-user-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-user-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-user-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-user-secondary">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}