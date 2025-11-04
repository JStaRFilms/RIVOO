'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MedicalProfile {
  id: string;
  dateOfBirth: string | null;
  bloodType: string | null;
  allergies: string[] | null;
  medications: string | null;
  conditions: string[] | null;
  emergencyContacts: Array<{ name: string; phone: string; email?: string; relationship?: string }> | null;
}

interface Allergy {
  id: string;
  name: string;
}

interface Condition {
  id: string;
  name: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  isEditing?: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    bloodType: '',
    allergies: [] as Allergy[],
    medications: '',
    conditions: [] as Condition[],
    emergencyContacts: [] as EmergencyContact[],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        // Helper function to parse string arrays from database
        const parseStringArray = (value: any): string[] => {
          if (!value) return [];
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') {
            try {
              // Try to parse as JSON first
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [value];
            } catch {
              // If not JSON, split by comma
              return value.split(',').map(s => s.trim()).filter(s => s);
            }
          }
          return [];
        };

        setFormData({
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          bloodType: data.bloodType || '',
          allergies: parseStringArray(data.allergies).map((allergy: string, index: number) => ({
            id: `allergy-${index}`,
            name: allergy
          })),
          medications: data.medications || '',
          conditions: parseStringArray(data.conditions).map((condition: string, index: number) => ({
            id: `condition-${index}`,
            name: condition
          })),
          emergencyContacts: data.emergencyContacts ? (() => {
            try {
              const parsed = typeof data.emergencyContacts === 'string'
                ? JSON.parse(data.emergencyContacts)
                : data.emergencyContacts;
              return Array.isArray(parsed) ? parsed.map((contact: any, index: number) => ({
                id: `contact-${index}`,
                name: contact.name,
                phone: contact.phone,
                email: contact.email || '',
                relationship: contact.relationship || ''
              })) : [];
            } catch {
              return [];
            }
          })() : [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for managing dynamic arrays
  const addAllergy = () => {
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, { id: `allergy-${Date.now()}`, name: '' }]
    }));
  };

  const removeAllergy = (id: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(allergy => allergy.id !== id)
    }));
  };

  const updateAllergy = (id: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.map(allergy =>
        allergy.id === id ? { ...allergy, name } : allergy
      )
    }));
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { id: `condition-${Date.now()}`, name: '' }]
    }));
  };

  const removeCondition = (id: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter(condition => condition.id !== id)
    }));
  };

  const updateCondition = (id: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map(condition =>
        condition.id === id ? { ...condition, name } : condition
      )
    }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, {
        id: `contact-${Date.now()}`,
        name: '',
        phone: '',
        email: '',
        relationship: ''
      }]
    }));
  };

  const removeEmergencyContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(contact => contact.id !== id)
    }));
  };

  const updateEmergencyContact = (id: string, field: keyof EmergencyContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const toggleEditEmergencyContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(contact =>
        contact.id === id ? { ...contact, isEditing: !contact.isEditing } : contact
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        allergies: formData.allergies.map(a => a.name).filter(name => name.trim() !== ''),
        conditions: formData.conditions.map(c => c.name).filter(name => name.trim() !== ''),
        emergencyContacts: formData.emergencyContacts.filter(contact =>
          contact.name.trim() !== '' || contact.phone.trim() !== ''
        ),
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        fetchProfile(); // Refresh the data
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen bg-user-bg font-sans">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6 text-user-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-user-text font-heading">Medical Profile</h1>
        </div>
      </div>

      <div className="h-[calc(100vh-65px)] overflow-y-auto pb-24">
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit}>
            {/* Intro Section */}
            <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
              <div className="flex">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <svg className="w-6 h-6 text-user-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-user-text mb-2 font-heading">Your medical information will be shared automatically during emergencies</h2>
                  <p className="text-user-secondary text-sm">This information helps first responders provide better care. All data is encrypted and only shared when you activate an emergency alert.</p>
                </div>
              </div>
            </div>

            {/* Blood Type Section */}
            <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-user-text mb-1 font-heading">Blood Type</h2>
                  <p className="text-sm text-user-secondary">Required for potential transfusions</p>
                </div>
                <div className="bg-green-100 text-user-primary text-xs font-medium px-3 py-1 rounded-full">
                  Required
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, bloodType: type }))}
                    className={`py-3 rounded-xl border-2 font-medium transition ${
                      formData.bloodType === type
                        ? 'border-user-primary text-user-primary bg-green-50'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies Section */}
            <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-user-text mb-1 font-heading">Allergies</h2>
                  <p className="text-sm text-user-secondary">Medication, food, or environmental allergies</p>
                </div>
              </div>

              <div className="space-y-3">
                {formData.allergies.map((allergy) => (
                  <div key={allergy.id} className="flex items-center bg-gray-50 p-3 rounded-xl">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-user-emergency" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full bg-transparent border-0 focus:ring-0 p-0 text-user-text"
                        placeholder="Penicillin"
                        value={allergy.name}
                        onChange={(e) => updateAllergy(allergy.id, e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAllergy(allergy.id)}
                      className="text-user-secondary hover:text-user-text"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addAllergy}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-user-secondary hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Allergy
                </button>
              </div>
            </div>

            {/* Chronic Conditions Section */}
            <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-user-text mb-1 font-heading">Chronic Conditions</h2>
                  <p className="text-sm text-user-secondary">Ongoing medical conditions</p>
                </div>
              </div>

              <div className="space-y-3">
                {formData.conditions.map((condition) => (
                  <div key={condition.id} className="flex items-center bg-gray-50 p-3 rounded-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-user-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full bg-transparent border-0 focus:ring-0 p-0 text-user-text"
                        placeholder="Diabetes"
                        value={condition.name}
                        onChange={(e) => updateCondition(condition.id, e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCondition(condition.id)}
                      className="text-user-secondary hover:text-user-text"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCondition}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-user-secondary hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Condition
                </button>
              </div>
            </div>

            {/* Emergency Contacts Section */}
            <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-user-text mb-1 font-heading">Emergency Contacts</h2>
                  <p className="text-sm text-user-secondary">Will be notified during emergencies</p>
                </div>
              </div>

              <div className="space-y-4">
                {formData.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="bg-gray-50 rounded-xl p-4">
                    {contact.isEditing ? (
                      // Edit mode
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-user-text">Edit Contact</h3>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => toggleEditEmergencyContact(contact.id)}
                              className="px-3 py-1 bg-user-primary text-white rounded-lg text-sm hover:bg-green-600 transition"
                            >
                              Done
                            </button>
                            <button
                              type="button"
                              onClick={() => removeEmergencyContact(contact.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <svg className="w-5 h-5 text-user-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-user-primary focus:border-transparent"
                            value={contact.name}
                            onChange={(e) => updateEmergencyContact(contact.id, 'name', e.target.value)}
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-user-primary focus:border-transparent"
                            value={contact.phone}
                            onChange={(e) => updateEmergencyContact(contact.id, 'phone', e.target.value)}
                          />
                          <input
                            type="email"
                            placeholder="Email (optional)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-user-primary focus:border-transparent"
                            value={contact.email}
                            onChange={(e) => updateEmergencyContact(contact.id, 'email', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Relationship (e.g., Spouse, Parent, Friend)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-user-primary focus:border-transparent"
                            value={contact.relationship}
                            onChange={(e) => updateEmergencyContact(contact.id, 'relationship', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-user-text">{contact.relationship || 'Contact'}</p>
                            <p className="text-sm text-user-secondary">{contact.name || 'Name not provided'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className="p-1 hover:bg-gray-200 rounded"
                              onClick={() => toggleEditEmergencyContact(contact.id)}
                            >
                              <svg className="w-5 h-5 text-user-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeEmergencyContact(contact.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <svg className="w-5 h-5 text-user-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="pl-2 border-l-2 border-user-primary">
                          <p className="text-sm text-user-text">{contact.phone || 'Phone not provided'}</p>
                          {contact.email && <p className="text-sm text-user-secondary">{contact.email}</p>}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addEmergencyContact}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-user-secondary hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Contact
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-4 border-t">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full py-4 bg-user-primary text-white rounded-2xl font-medium text-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Medical Profile'}
        </button>
      </div>
    </div>
  );
}
