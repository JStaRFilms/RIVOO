// app/api/incidents/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET a single incident by ID
export async function GET(
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

    // Find the incident with all related data
    const incident = await prisma.incident.findUnique({
      where: { id },
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
            latitude: true,
            longitude: true,
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
        },
        medicalProfile: {
          select: {
            bloodType: true,
            allergies: true,
            conditions: true,
            medications: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
          }
        }
      },
    });

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    // ✅ CRITICAL: Return in the format the dashboard context expects
    return NextResponse.json({ 
      incident 
    });
  } catch (error) {
    console.error("Get Incident Error:", error);
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

// PATCH to update incident (for marking as RESOLVED, adding notes, etc.)
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
    const body = await req.json();
    const { status, notes } = body;

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

    // Prepare update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // Set resolvedAt timestamp when marking as RESOLVED
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update the incident
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: updateData,
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

    console.log(`✅ Incident ${id} updated to status: ${status || 'unchanged'}`);

    return NextResponse.json({ 
      success: true,
      incident: updatedIncident 
    });
  } catch (error) {
    console.error("Update Incident Error:", error);
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