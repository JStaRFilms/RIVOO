import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Build query conditions
    const where: any = {
      facilityId: { not: null }, // Only show incidents assigned to a facility
    };
    
    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Fetch incidents with user details
    const incidents = await prisma.incident.findMany({
      where,
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
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Log for debugging
    console.log(`Found ${incidents.length} incidents assigned to facilities`);
    if (incidents.length > 0) {
      console.log('Sample incident:', {
        id: incidents[0].id,
        hasUser: !!incidents[0].user,
        userEmail: incidents[0].user?.email,
        facility: incidents[0].facility?.name,
        status: incidents[0].status,
      });
    }

    return NextResponse.json(incidents);
  } catch (error) {
    console.error("Get Incidents Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}