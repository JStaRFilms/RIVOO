// components/ReportModal.tsx
'use client';

import { useState } from 'react';
import { X, User, Users, AlertCircle, Loader2, MapPin, Phone, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportMode = 'self' | 'other';

interface SymptomAnalysis {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  possibleConditions: string[];
  recommendedAction: string;
  estimatedResponseTime: string;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [mode, setMode] = useState<ReportMode>('self');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    personName: '',
    location: '',
    contactNumber: '',
    symptoms: '',
    additionalInfo: '',
  });

  if (!isOpen) return null;

  const handleModeSelect = (selectedMode: ReportMode) => {
    setMode(selectedMode);
    setStep(2);
  };

  const analyzeSymptoms = async () => {
    setAnalyzing(true);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are a medical triage AI assistant. Analyze these emergency symptoms and provide a structured assessment.

Symptoms: ${formData.symptoms}
Additional Info: ${formData.additionalInfo || 'None provided'}

Respond ONLY with a JSON object in this exact format (no markdown, no backticks):
{
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "recommendedAction": "Brief action recommendation",
  "estimatedResponseTime": "5-10 minutes" or similar
}

Severity guidelines:
- CRITICAL: Life-threatening (chest pain, difficulty breathing, severe bleeding, loss of consciousness)
- HIGH: Serious but not immediately life-threatening (high fever, severe pain, suspected fractures)
- MEDIUM: Requires medical attention soon (moderate pain, persistent vomiting, minor injuries)
- LOW: Can wait for routine care (mild symptoms, minor cuts, cold/flu symptoms)`
            }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.content.find((c: any) => c.type === 'text')?.text || '';
      
      // Parse the JSON response
      const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
      const parsedAnalysis: SymptomAnalysis = JSON.parse(cleanResponse);
      
      setAnalysis(parsedAnalysis);
      setStep(3);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Fallback analysis if AI fails
      setAnalysis({
        severity: 'MEDIUM',
        possibleConditions: ['Unable to analyze - please describe symptoms in detail'],
        recommendedAction: 'Emergency services will assess your situation',
        estimatedResponseTime: '10-15 minutes'
      });
      setStep(3);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (step === 2 && formData.symptoms.trim()) {
      await analyzeSymptoms();
    } else if (step === 3) {
      // Submit to backend
      try {
        const response = await fetch('/api/report-emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            ...formData,
            analysis,
          })
        });

        if (response.ok) {
          alert('Emergency report submitted successfully! Help is on the way.');
          onClose();
          resetForm();
        } else {
          alert('Failed to submit report. Please try again.');
        }
      } catch (error) {
        console.error('Submit error:', error);
        alert('Failed to submit report. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setMode('self');
    setStep(1);
    setAnalyzing(false);
    setAnalysis(null);
    setFormData({
      personName: '',
      location: '',
      contactNumber: '',
      symptoms: '',
      additionalInfo: '',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-[#003049]">Report Emergency</h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 && 'Choose who needs help'}
              {step === 2 && 'Describe the emergency'}
              {step === 3 && 'AI Analysis Complete'}
            </p>
          </div>
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-[#003049]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 1: Mode Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Are you reporting for yourself or someone else?
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleModeSelect('self')}
                  className="group relative overflow-hidden border-2 border-gray-200 rounded-xl p-8 hover:border-[#003049] hover:bg-[#003049] transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
                      <User className="w-8 h-8 text-[#003049]" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors">
                        For Myself
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-200 transition-colors mt-2">
                        I need emergency help
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleModeSelect('other')}
                  className="group relative overflow-hidden border-2 border-gray-200 rounded-xl p-8 hover:border-[#003049] hover:bg-[#003049] transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
                      <Users className="w-8 h-8 text-[#003049]" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors">
                        For Someone Else
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-200 transition-colors mt-2">
                        Someone near me needs help
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Emergency Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Reporting for: </strong>
                  {mode === 'self' ? 'Yourself' : 'Someone else'}
                </div>
              </div>

              {mode === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Person's Name
                  </label>
                  <input
                    type="text"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    placeholder="Enter patient's name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003049] focus:border-transparent outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location or address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003049] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="Enter contact number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003049] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Symptoms / Emergency Description *
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Describe the symptoms in detail: pain location, intensity, breathing difficulty, bleeding, consciousness level, etc."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003049] focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Pre-existing conditions, allergies, medications, etc."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003049] focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: AI Analysis Results */}
          {step === 3 && analysis && (
            <div className="space-y-5">
              {/* Severity Badge */}
              <div className={`border-2 rounded-xl p-6 ${getSeverityColor(analysis.severity)}`}>
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Severity Assessment</h3>
                </div>
                <p className="text-2xl font-bold">{analysis.severity}</p>
                <p className="text-sm mt-1">Estimated Response Time: {analysis.estimatedResponseTime}</p>
              </div>

              {/* Possible Conditions */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3">Possible Conditions</h4>
                <ul className="space-y-2">
                  {analysis.possibleConditions.map((condition, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Action */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-blue-900 mb-2">Recommended Action</h4>
                <p className="text-blue-800">{analysis.recommendedAction}</p>
              </div>

              {/* Summary */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3">Report Summary</h4>
                <div className="space-y-2 text-sm">
                  {mode === 'other' && formData.personName && (
                    <p><strong>Patient:</strong> {formData.personName}</p>
                  )}
                  {formData.location && (
                    <p><strong>Location:</strong> {formData.location}</p>
                  )}
                  {formData.contactNumber && (
                    <p><strong>Contact:</strong> {formData.contactNumber}</p>
                  )}
                  <p><strong>Symptoms:</strong> {formData.symptoms}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
              disabled={analyzing}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Back
            </button>
          )}
          
          <button
            onClick={step === 3 ? handleSubmit : (step === 2 ? handleSubmit : undefined)}
            disabled={(step === 2 && !formData.symptoms.trim()) || analyzing}
            className="flex-1 bg-[#003049] text-white py-3 rounded-lg hover:bg-[#004d73] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with AI...
              </>
            ) : step === 3 ? (
              'Send Emergency Report'
            ) : step === 2 ? (
              'Analyze Symptoms'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}