// /app/dashboard/components/LiveCaseCard.tsx
import React from 'react';
import { LiveCase } from '@/lib/types'; 
import { ProgressBar } from './ProgressBar';

interface LiveCaseCardProps {
  liveCase: LiveCase | null;
}

export const LiveCaseCard = ({ liveCase }: LiveCaseCardProps) => {
  if (!liveCase) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-sea-green">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-sea-green rounded-full animate-pulse" />
        <h3 className="text-lg font-lato font-bold text-prussian-blue">
          Live Case Status
        </h3>
      </div>
      <p className="text-2xl font-lato font-bold text-prussian-blue mb-2">
        Case #{liveCase.hospital}
      </p>
      <p className="text-sm text-slate-gray mb-1">
        Hospital Found: {liveCase.hospitalFound ? 'Yes' : 'Searching...'}
      </p>
      <p className="text-sm text-prussian-blue font-medium mb-6">
        {liveCase.hospital}
      </p>
      <ProgressBar step={liveCase.progress} />
    </div>
  );
};