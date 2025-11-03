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
    const nearestFacilityId = location ? findNearestFacility(location.lat, location.lng) : null;

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
        description: details || notes,
        notes: patientName ? `Patient: ${patientName}, Condition: ${condition}` : undefined,
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
