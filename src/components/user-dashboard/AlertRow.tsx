// /app/dashboard/components/AlertRow.tsx
import React from 'react';
import { Alert } from '@/lib/types';

export const AlertRow = ({ alert }: { alert: Alert }) => (
  <tr className="border-b border-seasalt hover:bg-seasalt/50 transition-colors">
    <td className="py-4 px-4 text-sm text-prussian-blue">{alert.date}</td>
    <td className="py-4 px-4 text-sm text-prussian-blue">{alert.alert}</td>
    <td className="py-4 px-4">
      <span
        className={`text-sm font-medium ${
          alert.status === 'Resolved' ? 'text-sea-green' : 'text-fire-brick'
        }`}
      >
        {alert.status}
      </span>
    </td>
    <td className="py-4 px-4 text-sm text-prussian-blue">{alert.hospital}</td>
    <td className="py-4 px-4 text-sm text-slate-gray">{alert.id}</td>
  </tr>
);