import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

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

    // Check if incident is still pending
    if (incident.status !== 'PENDING') {
      return NextResponse.json(
        { error: "Incident already processed" },
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

    return NextResponse.json({ incident: updatedIncident });
  } catch (error) {
    console.error("Accept Incident Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Update incident to IN_PROGRESS (ambulance dispatched)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!['IN_PROGRESS', 'RESOLVED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        status,
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
      include: {
        facility: true,
      },
    });

    return NextResponse.json({ incident: updatedIncident });
  } catch (error) {
    console.error("Update Incident Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}