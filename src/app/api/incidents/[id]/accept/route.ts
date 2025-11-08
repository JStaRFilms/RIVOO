import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST to accept an incident (Next.js 15 compatible)
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle both Next.js 14 and 15 params format
    const params = 'then' in context.params ? await context.params : context.params;
    const { id } = params;

    console.log('Attempting to accept incident:', id);

    // Find the incident
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      console.error('Incident not found:', id);
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    console.log('Current incident status:', incident.status);

    // Check if incident is still pending
    if (incident.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Incident already ${incident.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Update incident status to ASSIGNED
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        status: 'ASSIGNED',
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
      },
    });

    console.log(`✅ Incident ${id} accepted by hospital staff`);

    return NextResponse.json({ 
      success: true,
      incident: updatedIncident 
    });
  } catch (error) {
    console.error("Accept Incident Error:", error);
    
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// PATCH to dispatch ambulance (move to IN_PROGRESS) (Next.js 15 compatible)
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle both Next.js 14 and 15 params format
    const params = 'then' in context.params ? await context.params : context.params;
    const { id } = params;

    console.log('Attempting to dispatch for incident:', id);

    // Find the incident
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      console.error('Incident not found:', id);
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    console.log('Current incident status:', incident.status);

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
      },
    });

    console.log(`🚑 Ambulance dispatched for incident ${id}`);

    return NextResponse.json({ 
      success: true,
      incident: updatedIncident 
    });
  } catch (error) {
    console.error("Dispatch Incident Error:", error);
    
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}