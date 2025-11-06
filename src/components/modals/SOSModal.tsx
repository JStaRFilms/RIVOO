// /app/dashboard/modals/SOSModal.tsx
"use client";
import React from 'react';
import { SOSAlertData } from '@/lib/types';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertData: SOSAlertData | null;
}

export const SOSModal = ({ isOpen, onClose, alertData }: SOSModalProps) => {
  if (!isOpen || !alertData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-sea-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sea-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-xl font-lato font-bold text-prussian-blue mb-2">
            SOS Alert Sent Successfully!
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-gray mb-6">
            Your emergency alert has been sent to nearby hospitals with your location and medical information.
          </p>

          {/* Alert Details */}
          <div className="bg-seasalt rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-gray">Case ID:</span>
                <span className="text-prussian-blue font-medium">{alertData.caseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-gray">Location:</span>
                <span className="text-prussian-blue font-medium">
                  {alertData.location
                    ? `${alertData.location.latitude.toFixed(4)}, ${alertData.location.longitude.toFixed(4)}`
                    : 'Acquiring...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-gray">Time:</span>
                <span className="text-prussian-blue font-medium">{alertData.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-gray">Blood Type:</span>
                <span className="text-prussian-blue font-medium">{alertData.bloodType}</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-sea-green hover:bg-sea-green/90 text-white rounded-lg py-3 font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};