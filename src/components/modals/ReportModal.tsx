// /app/dashboard/modals/ReportModal.tsx
"use client";
import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal = ({ isOpen, onClose }: ReportModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    emergency: '',
    contact: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      alert(`Emergency report submitted for ${formData.name}`);
      setSubmitting(false);
      onClose();
      setFormData({ name: '', location: '', emergency: '', contact: '' });
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-lato font-bold text-prussian-blue">
            Report Emergency for Another
          </h3>
          <button
            onClick={onClose}
            className="text-slate-gray hover:text-prussian-blue"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... (Form fields remain unchanged) ... */}
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-2">
                Person Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sea-green focus:border-transparent"
                placeholder="Enter name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-2">
                Location
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sea-green focus:border-transparent"
                placeholder="Enter location or address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-2">
                Type of Emergency
              </label>
              <select
                required
                value={formData.emergency}
                onChange={(e) => setFormData({...formData, emergency: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sea-green focus:border-transparent"
              >
                <option value="">Select emergency type</option>
                <option value="medical">Medical Emergency</option>
                <option value="accident">Accident</option>
                <option value="assault">Assault</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sea-green focus:border-transparent"
                placeholder="Enter contact number"
              />
            </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-prussian-blue rounded-lg font-medium hover:bg-seasalt transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-orange-peel hover:bg-orange-peel/90 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};