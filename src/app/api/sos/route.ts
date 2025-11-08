import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Facility } from "@prisma/client";

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

// Helper to extract coordinates from PostGIS geography
function extractCoordinates(location: any): { lat: number; lng: number } | null {
  if (!location) return null;
  
  // Handle different formats PostGIS might return
  if (typeof location === 'string') {
    try {
      const parsed = JSON.parse(location);
      if (parsed.coordinates && Array.isArray(parsed.coordinates)) {
        return { lng: parsed.coordinates[0], lat: parsed.coordinates[1] };
      }
    } catch {
      return null;
    }
  }
  
  if (location.coordinates && Array.isArray(location.coordinates)) {
    return { lng: location.coordinates[0], lat: location.coordinates[1] };
  }
  
  return null;
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

    // Fetch all facilities using raw query to get PostGIS data
    const facilities = await prisma.$queryRaw<any[]>`
      SELECT 
        id, 
        name, 
        address, 
        city, 
        state,
        phone,
        ST_AsGeoJSON(location)::json as location,
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) as distance
      FROM facilities
      ORDER BY distance
      LIMIT 5
    `;

    // Format facilities data
    const formattedFacilities = facilities.map((facility) => {
      const coords = extractCoordinates(facility.location);
      return {
        id: facility.id,
        name: facility.name,
        address: facility.address,
        city: facility.city,
        state: facility.state,
        phone: facility.phone,
        distance: Math.round(facility.distance), // Distance in meters
        ...(coords && {
          locationLat: coords.lat,
          locationLng: coords.lng,
        }),
      };
    });

    // Automatically assign to nearest facility
    if (formattedFacilities.length > 0) {
      await prisma.incident.update({
        where: { id: newIncident.id },
        data: {
          facilityId: formattedFacilities[0].id,
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
          displayId: formatIncidentId(newIncident.id), // Add formatted display ID
        },
        facilities: formattedFacilities 
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