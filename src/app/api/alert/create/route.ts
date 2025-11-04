import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface AlertRequest {
  type: 'sos' | 'report';
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  patientName?: string;
  condition?: string;
  details?: string;
  notes?: string;
}

function findNearestFacility(userLat: number, userLng: number) {
  // Placeholder implementation - in a real app, this would:
  // 1. Query all facilities from database
  // 2. Calculate distances using a mapping service (Google Maps, Mapbox, etc.)
  // 3. Return the closest facility with available capacity

  // For now, return a mock facility ID
  return 'facility-001';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: AlertRequest = await request.json();
    const { type, location, patientName, condition, details, notes } = body;

    if (!location && type === 'sos') {
      return NextResponse.json(
        { message: 'Location is required for SOS alerts' },
        { status: 400 }
      );
    }

    // Find nearest facility (placeholder implementation)
    // For now, we'll set facilityId to null since we don't have facilities in the database
    const nearestFacilityId = null; // location ? findNearestFacility(location.lat, location.lng) : null;

    // Fetch user's medical profile for SOS alerts
    let medicalProfile = null;
    if (type === 'sos') {
      medicalProfile = await prisma.medicalProfile.findUnique({
        where: { userId: session.user.id },
      });
    }

    // Build description with medical information for SOS alerts
    let description = details || notes;
    let medicalNotes = '';

    if (type === 'sos' && medicalProfile) {
      const medicalInfo = [];

      // Helper function to parse stored medical data (could be JSON or comma-separated)
      const parseMedicalData = (value: string | null): string[] => {
        if (!value) return [];
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value];
        } catch {
          // If not JSON, split by comma
          return value.split(',').map(s => s.trim()).filter(s => s);
        }
      };

      if (medicalProfile.bloodType) medicalInfo.push(`Blood Type: ${medicalProfile.bloodType}`);

      const allergies = parseMedicalData(medicalProfile.allergies);
      if (allergies.length > 0) medicalInfo.push(`Allergies: ${allergies.join(', ')}`);

      if (medicalProfile.medications) medicalInfo.push(`Medications: ${medicalProfile.medications}`);

      const conditions = parseMedicalData(medicalProfile.conditions);
      if (conditions.length > 0) medicalInfo.push(`Conditions: ${conditions.join(', ')}`);

      if (medicalProfile.emergencyContactName && medicalProfile.emergencyContactPhone) {
        medicalInfo.push(`Emergency Contact: ${medicalProfile.emergencyContactName} (${medicalProfile.emergencyContactPhone})`);
      }

      if (medicalInfo.length > 0) {
        medicalNotes = `Medical Profile: ${medicalInfo.join('; ')}`;
      }
    } else if (patientName) {
      medicalNotes = `Patient: ${patientName}, Condition: ${condition}`;
    }

    // Create the incident
    const incident = await prisma.incident.create({
      data: {
        userId: session.user.id,
        facilityId: nearestFacilityId,
        status: 'PENDING',
        priority: type === 'sos' ? 'HIGH' : 'MEDIUM',
        locationLat: location?.lat || 0,
        locationLng: location?.lng || 0,
        address: location?.address,
        description: description,
        notes: medicalNotes || undefined,
      },
    });

    // In a real implementation, you would also:
    // 1. Notify the assigned facility
    // 2. Send push notifications to relevant staff
    // 3. Update facility availability
    // 4. Log the incident for analytics

    return NextResponse.json({
      id: incident.id,
      status: incident.status,
      createdAt: incident.createdAt,
      locationLat: incident.locationLat,
      locationLng: incident.locationLng,
      address: incident.address,
      description: incident.description,
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
