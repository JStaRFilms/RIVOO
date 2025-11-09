// app/api/incidents/route.ts
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
    const where: any = {};
    
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
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // ✅ FIX: Return in the format the hospital dashboard expects
    return NextResponse.json({ 
      incidents,
      count: incidents.length 
    });
  } catch (error) {
    console.error("Get Incidents Error:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : "Unknown error")
          : undefined
      },
      { status: 500 }
    );
  }
}