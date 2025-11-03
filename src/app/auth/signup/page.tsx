'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the combined auth page with signup tab active
    router.replace('/auth/signin?tab=signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-user-bg">
      <div className="text-center">
        <div className="bg-user-primary w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5">
          <span className="text-white font-bold text-2xl">R</span>
        </div>
        <p className="text-user-secondary">Redirecting to sign up...</p>
      </div>
    </div>
  );
}
