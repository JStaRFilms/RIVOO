// app/api/incidents/[id]/accept/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST to accept an incident
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    console.log('🔐 Session:', session?.user);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX: Await params in Next.js 15
    const { id } = await context.params;

    console.log('🚨 Accepting incident:', id);

    // ✅ Get user and check if they're hospital staff
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log('👤 User found:', { id: user?.id, role: user?.role });

    if (!user || user.role !== 'HOSPITAL_STAFF') {
      return NextResponse.json(
        { error: "Only hospital staff can accept incidents" },
        { status: 403 }
      );
    }

    // ✅ Separately query for facility user info
    const facilityUser = await prisma.facilityUser.findUnique({
      where: { userId: user.id },
      include: {
        facility: true
      }
    });

    console.log('🏥 Facility user found:', facilityUser?.id);

    if (!facilityUser) {
      return NextResponse.json(
        { error: "Staff member not associated with any facility" },
        { status: 403 }
      );
    }

    // Find the incident
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    console.log('📋 Incident current status:', incident.status);

    // Check if incident is still pending
    if (incident.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Incident already ${incident.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // ✅ Update incident with all required fields
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        status: 'ASSIGNED',
        facilityId: facilityUser.facilityId,
        assignedToId: facilityUser.id,
        acceptedAt: new Date(),
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
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            facility: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
    });

    console.log(`✅ Incident ${id} accepted successfully by ${user.name} at ${facilityUser.facility.name}`);

    return NextResponse.json({ 
      success: true,
      incident: updatedIncident 
    });
  } catch (error) {
    console.error("❌ Accept Incident Error:", error);
    
    // ✅ Detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : "Unknown error")
          : "An error occurred"
      },
      { status: 500 }
    );
  }
}

// PATCH to dispatch ambulance (move to IN_PROGRESS)
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX: Await params in Next.js 15
    const { id } = await context.params;

    // ✅ Verify user is hospital staff
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'HOSPITAL_STAFF') {
      return NextResponse.json(
        { error: "Only hospital staff can dispatch ambulances" },
        { status: 403 }
      );
    }

    // Find the incident
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    // Check if incident has been accepted
    if (incident.status === 'PENDING') {
      return NextResponse.json(
        { error: "Incident must be accepted first" },
        { status: 400 }
      );
    }

    if (incident.status === 'RESOLVED' || incident.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Incident already ${incident.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Update to IN_PROGRESS
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
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
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      },
    });

    console.log(`🚑 Ambulance dispatched for incident ${id}`);

    return NextResponse.json({ 
      success: true,
      incident: updatedIncident 
    });
  } catch (error) {
    console.error("Dispatch Incident Error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : "Unknown error")
          : "An error occurred"
      },
      { status: 500 }
    );
  }
}