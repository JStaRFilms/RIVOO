// /app/dashboard/components/RecentAlertsTable.tsx
import React from 'react';
import { Alert } from '@/lib/types'; 
import { AlertRow } from './AlertRow';

interface RecentAlertsTableProps {
  alerts: Alert[];
}

export const RecentAlertsTable = ({ alerts }: RecentAlertsTableProps) => (
  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-lato font-bold text-prussian-blue">
        Recent Alerts
      </h3>
      <button className="text-sm text-sea-green font-medium hover:underline">
        View All
      </button>
    </div>
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-seasalt">
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
              Date
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
              Alert
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
              Hospital
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-gray uppercase tracking-wider">
              ID
            </th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);