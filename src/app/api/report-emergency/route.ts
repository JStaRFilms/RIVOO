// app/api/report-emergency/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      mode,
      personName,
      location,
      contactNumber,
      symptoms,
      additionalInfo,
      analysis,
      latitude,
      longitude,
    } = body;

    console.log('📝 Received emergency report:', {
      mode,
      severity: analysis?.severity,
      symptoms: symptoms?.substring(0, 50) + '...',
    });

    // Use provided coordinates or fallback
    let userLat: number = latitude || 6.4541; // Default to Lagos
    let userLng: number = longitude || 3.3947;

    // Get user's medical profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        medicalProfile: true,
      },
    });

    // Map AI severity to incident priority
    const priorityMap: { [key: string]: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } = {
      'LOW': 'LOW',
      'MEDIUM': 'MEDIUM',
      'HIGH': 'HIGH',
      'CRITICAL': 'CRITICAL',
    };

    const priority = priorityMap[analysis.severity] || 'MEDIUM';

    // Find nearby facilities
    const facilities = await prisma.facility.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        phone: true,
        latitude: true,
        longitude: true,
      },
    });

    // Calculate distances and sort
    const facilitiesWithDistance = facilities
      .map((facility) => ({
        ...facility,
        distance: calculateDistance(
          userLat,
          userLng,
          facility.latitude,
          facility.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    const nearestFacility = facilitiesWithDistance[0];

    console.log(`🏥 Nearest facility: ${nearestFacility?.name} (${Math.round(nearestFacility?.distance / 1000)}km away)`);

    // Create incident with AI analysis
    const incident = await prisma.incident.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        priority,
        locationLat: userLat,
        locationLng: userLng,
        address: location || 'Location not provided',
        description: symptoms,
        notes: additionalInfo || undefined,
        personName: mode === 'other' ? personName : undefined,
        alertSource: mode === 'other' ? 'SAMARITAN' : 'USER',
        aiAnalysis: {
          severity: analysis.severity,
          possibleConditions: analysis.possibleConditions,
          recommendedAction: analysis.recommendedAction,
          estimatedResponseTime: analysis.estimatedResponseTime,
          analyzedAt: new Date().toISOString(),
          symptoms: symptoms,
          additionalInfo: additionalInfo || null,
        },
        medicalProfileId: user?.medicalProfile?.id,
        // Assign to nearest facility
        facilityId: nearestFacility?.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        facility: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone: true,
          },
        },
        medicalProfile: {
          select: {
            bloodType: true,
            allergies: true,
            conditions: true,
            medications: true,
          },
        },
      },
    });

    console.log(`✅ Emergency report created: ${incident.id}`);
    console.log(`🚨 Priority: ${priority} | AI Severity: ${analysis.severity}`);

    // Return incident with matched facilities in the SAME format as SOS endpoint
    return NextResponse.json({
      success: true,
      incident,
      facilities: facilitiesWithDistance.slice(0, 3).map((f) => ({
        id: f.id,
        name: f.name,
        address: f.address,
        city: f.city,
        phone: f.phone,
        distance: f.distance,
      })),
      message: `Emergency report submitted. ${nearestFacility.name} has been notified.`,
    });
  } catch (error) {
    console.error('❌ Report Emergency Error:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'An error occurred',
      },
      { status: 500 }
    );
  }
}