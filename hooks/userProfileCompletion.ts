import { useState, useEffect, useCallback } from 'react';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  isLoading: boolean;
  missingFields: string[];
  refresh: () => Promise<void>;
}

export function useProfileCompletion(): ProfileCompletionStatus {
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const checkProfileCompletion = useCallback(async () => {
    try {
      const response = await fetch('/api/user/medical-profile', { cache: 'no-store' });
      if (response.ok) {
        const profile = await response.json();
        const required = ['bloodType', 'emergencyContactPhone', 'emergencyContactName'];
        const missing: string[] = [];

        required.forEach((field) => {
          if (!profile[field] || profile[field] === '') missing.push(field);
        });

        setMissingFields(missing);
        setIsComplete(missing.length === 0);
      } else {
        setMissingFields(['bloodType', 'emergencyContactPhone', 'emergencyContactName']);
        setIsComplete(false);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setIsComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkProfileCompletion();
  }, [checkProfileCompletion]);

  return { isComplete, isLoading, missingFields, refresh: checkProfileCompletion };
}
