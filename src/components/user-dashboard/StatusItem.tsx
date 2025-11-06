// /app/dashboard/components/StatusItem.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface StatusItemProps {
  type: 'success' | 'warning';
  message: string;
}

export const StatusItem = ({ type, message }: StatusItemProps) => {
  const Icon = type === 'success' ? (
    <div className="w-5 h-5 rounded-full bg-sea-green flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ) : (
    <div className="w-5 h-5 rounded-full bg-orange-peel flex items-center justify-center">
      <AlertCircle className="w-3 h-3 text-white" />
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      {Icon}
      <span className={`text-sm ${type === 'success' ? 'text-prussian-blue' : 'text-slate-gray'}`}>
        {message}
      </span>
    </div>
  );
};