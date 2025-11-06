// /app/dashboard/components/MyHealthCard.tsx
import React from 'react';
import { HealthInfo } from '@/lib/types';
import { HealthInfoRow } from './HealthInfoRow';

interface MyHealthCardProps {
  healthInfo: HealthInfo;
}

export const MyHealthCard = ({ healthInfo }: MyHealthCardProps) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-lg font-lato font-bold text-prussian-blue mb-4">
      My Health
    </h3>
    <div className="space-y-0">
      <HealthInfoRow label="Blood Type" value={healthInfo.bloodType} />
      <HealthInfoRow label="Allergies" value={healthInfo.allergies} />
      <HealthInfoRow label="Conditions" value={healthInfo.conditions} />
      <HealthInfoRow label="Medication" value={healthInfo.medication} />
    </div>
  </div>
);