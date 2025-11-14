'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useProfileCompletion } from '../../../../../hooks/userProfileCompletion';

interface ProfileData {
  bloodType: string;
  allergies: string;
  conditions: string;
  medication: string;
  emergencyContact: string;
  emergencyContactName: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { refresh } = useProfileCompletion();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    bloodType: '',
    allergies: '',
    conditions: '',
    medication: '',
    emergencyContact: '',
    emergencyContactName: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/user/medical-profile', {
          credentials: 'include',
        });

        if (response.ok) {
          const profile = await response.json();
          setFormData({
            bloodType: profile.bloodType || '',
            allergies: profile.allergies || '',
            conditions: profile.conditions || '',
            medication: profile.medications || '',
            emergencyContact: profile.emergencyContactPhone || '',
            emergencyContactName: profile.emergencyContactName || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user/medical-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('✅ Profile updated successfully!');
        await refresh();
        setTimeout(() => router.push('/user/dashboard'), 1500);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save profile.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-user-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-user-text/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-user-primary/10 flex items-center justify-center">
            <span className="text-xl font-medium text-user-primary">U</span>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-heading font-bold text-user-text">
              My Profile
            </h1>
            <p className="text-user-text/60">
              Complete your profile for emergency services
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium">
              Please complete your profile to access the dashboard
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Medical Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-black">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-user-primary" />
            <h2 className="text-lg font-heading font-bold text-user-text">
              Medical Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-user-text mb-2">
                Blood Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bloodType}
                onChange={(e) => handleChange('bloodType', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-user-primary focus:border-transparent"
              >
                <option value="">Select blood type</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {['allergies', 'conditions', 'medication'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-user-text mb-2 capitalize">
                  {field}
                </label>
                <input
                  type="text"
                  value={(formData as any)[field]}
                  onChange={(e) => handleChange(field as keyof ProfileData, e.target.value)}
                  placeholder={`Enter your ${field}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-user-primary focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-black">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="w-5 h-5 text-user-primary" />
            <h2 className="text-lg font-heading font-bold text-user-text">
              Emergency Contact
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-user-text mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                placeholder="e.g., John Doe"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-user-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-user-text mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                placeholder="e.g., +234 801 234 5678"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-user-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-user-primary hover:bg-user-primary/90 text-white rounded-lg py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
