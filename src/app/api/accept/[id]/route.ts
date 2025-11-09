// // src/app/api/alert/create/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';

// interface AlertRequest {
//   type: 'sos' | 'report';
//   location?: {
//     lat: number;
//     lng: number;
//     address?: string;
//   };
//   patientName?: string;
//   condition?: string;
//   details?: string;
//   notes?: string;
// }

// // Calculate distance between two points using Haversine formula
// function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
//   const R = 6371; // Earth's radius in km
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = 
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// async function findNearestFacility(userLat: number, userLng: number) {
//   try {
//     // Get all facilities
//     const facilities = await prisma.facility.findMany({
//       select: {
//         id: true,
//         name: true,
//         latitude: true,
//         longitude: true,
//         address: true,
//       },
//     });

//     if (facilities.length === 0) {
//       return null;
//     }

//     // Calculate distances and find nearest
//     let nearest = facilities[0];
//     let minDistance = calculateDistance(userLat, userLng, nearest.latitude, nearest.longitude);

//     for (const facility of facilities.slice(1)) {
//       const distance = calculateDistance(userLat, userLng, facility.latitude, facility.longitude);
//       if (distance < minDistance) {
//         minDistance = distance;
//         nearest = facility;
//       }
//     }

//     return nearest.id;
//   } catch (error) {
//     console.error('Error finding nearest facility:', error);
//     return null;
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { message: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const body: AlertRequest = await request.json();
//     const { type, location, patientName, condition, details, notes } = body;

//     // Validate required fields
//     if (!location?.lat || !location?.lng) {
//       return NextResponse.json(
//         { message: 'Location is required' },
//         { status: 400 }
//       );
//     }

//     // Find nearest facility
//     const nearestFacilityId = await findNearestFacility(location.lat, location.lng);

//     if (!nearestFacilityId) {
//       return NextResponse.json(
//         { message: 'No facilities available' },
//         { status: 503 }
//       );
//     }

//     // Determine priority based on type and condition
//     let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
//     if (type === 'sos') {
//       priority = 'HIGH';
//     }
//     if (condition?.toLowerCase().includes('severe') || 
//         condition?.toLowerCase().includes('critical') ||
//         condition?.toLowerCase().includes('chest pain') ||
//         condition?.toLowerCase().includes('breathing')) {
//       priority = 'CRITICAL';
//     }

//     // Build description
//     let description = details || notes || '';
//     if (condition) {
//       description = condition + (description ? ': ' + description : '');
//     }

//     // Create the incident
//     const incident = await prisma.incident.create({
//       data: {
//         userId: session.user.id,
//         facilityId: nearestFacilityId,
//         status: 'PENDING',
//         priority,
//         locationLat: location.lat,
//         locationLng: location.lng,
//         address: location.address || undefined,
//         description: description || undefined,
//         personName: patientName || undefined,
//         notes: notes || undefined,
//         alertSource: type === 'report' ? 'SAMARITAN' : 'USER',
//       },
//       include: {
//         facility: {
//           select: {
//             name: true,
//             address: true,
//             phone: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       incident: {
//         id: incident.id,
//         publicId: incident.publicId,
//         status: incident.status,
//         priority: incident.priority,
//         createdAt: incident.createdAt,
//         locationLat: incident.locationLat,
//         locationLng: incident.locationLng,
//         address: incident.address,
//         description: incident.description,
//         facility: incident.facility,
//       },
//     });

//   } catch (error) {
//     console.error('Error creating alert:', error);
//     return NextResponse.json(
//       { 
//         success: false,
//         message: 'Failed to create alert',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }