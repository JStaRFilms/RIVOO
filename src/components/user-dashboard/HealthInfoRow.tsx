// /app/dashboard/components/HealthInfoRow.tsx
import React from 'react';

interface HealthInfoRowProps {
  label: string;
  value: string;
}

export const HealthInfoRow = ({ label, value }: HealthInfoRowProps) => (
  <div className="flex justify-between items-center py-3 border-b border-seasalt last:border-0">
    <span className="text-sm text-slate-gray">{label}</span>
    <span className="text-sm text-prussian-blue font-medium">{value}</span>
  </div>
);