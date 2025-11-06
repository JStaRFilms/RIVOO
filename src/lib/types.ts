// /app/dashboard/lib/types.ts
export interface Alert {
  date: string;
  alert: string;
  status: 'Resolved' | 'Declined';
  hospital: string;
  id: string;
}

export interface LiveCase {
  caseId: string;
  hospitalFound: boolean;
  hospital: string;
  progress: number;
  timestamp: string;
}

export interface HealthInfo {
  bloodType: string;
  allergies: string;
  conditions: string;
  medication: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// We can also type the SOS alert data
export interface SOSAlertData {
  caseId: string;
  location: Location | null;
  timestamp: string;
  bloodType: string;
  conditions: string;
  allergies: string;
  medication: string;
}