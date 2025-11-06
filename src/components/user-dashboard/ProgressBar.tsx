// /app/dashboard/components/ProgressBar.tsx
import React from 'react';

export const ProgressBar = ({ step }: { step: number }) => {
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