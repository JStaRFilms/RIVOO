import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// --- Haversine Formula Helper ---
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3; // Radius of the Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to format incident ID for display
function formatIncidentId(id: string) {
  // Take last 8 characters of UUID and format nicely
  return `LAG-${id.slice(-8).toUpperCase()}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing location data" }, 
        { status: 400 }
      );
    }

    // Create the incident with proper schema fields
    const newIncident = await prisma.incident.create({
      data: {
        userId: session.user.id as string,
        status: 'PENDING',
        priority: 'CRITICAL',
        locationLat: latitude,
        locationLng: longitude,
        description: 'Emergency SOS Alert',
      },
    });

    // Fetch all facilities using Prisma (without PostGIS for now)
    // We'll calculate distances manually using Haversine formula
    const allFacilities = await prisma.facility.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        phone: true,
        latitude: true,
        longitude: true,
      },
    });

    // Calculate distances and sort
    const facilitiesWithDistance = allFacilities
      .filter(f => f.latitude != null && f.longitude != null)
      .map((facility) => {
        const distance = getDistanceInMeters(
          latitude,
          longitude,
          facility.latitude!,
          facility.longitude!
        );
        
        return {
          id: facility.id,
          name: facility.name,
          address: facility.address,
          city: facility.city,
          state: facility.state,
          phone: facility.phone,
          locationLat: facility.latitude,
          locationLng: facility.longitude,
          distance: Math.round(distance), // Distance in meters
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Get top 5 nearest

    // Automatically assign to nearest facility
    if (facilitiesWithDistance.length > 0) {
      await prisma.incident.update({
        where: { id: newIncident.id },
        data: {
          facilityId: facilitiesWithDistance[0].id,
        },
      });
    }

    // Fetch the updated incident with facility info
    const updatedIncident = await prisma.incident.findUnique({
      where: { id: newIncident.id },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(
      { 
        incident: {
          ...(updatedIncident || newIncident),
          displayId: formatIncidentId(newIncident.id),
        },
        facilities: facilitiesWithDistance 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SOS API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}