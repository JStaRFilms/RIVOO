// /app/dashboard/components/SafetyStatusCard.tsx
import React from 'react';
import { Location } from '@/lib/types';
import { StatusItem } from './StatusItem';

interface SafetyStatusCardProps {
  location: Location | null;
}

export const SafetyStatusCard = ({ location }: SafetyStatusCardProps) => (
  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
    <h3 className="text-lg font-lato font-bold text-prussian-blue mb-4">
      Safety Status
    </h3>
    <div className="space-y-3">
      <StatusItem
        type={location ? 'success' : 'warning'}
        message={location ? 'Location enabled' : 'Location disabled'}
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
);