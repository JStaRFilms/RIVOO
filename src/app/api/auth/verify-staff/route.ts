// src/app/api/auth/verify-staff/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { isStaff: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is hospital staff
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        facilityUser: {
          include: {
            facility: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { isStaff: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const isStaff = user.role === 'HOSPITAL_STAFF' && user.facilityUser !== null;

    return NextResponse.json({
      isStaff,
      staffInfo: isStaff ? {
        staffId: user.facilityUser?.staffId,
        department: user.facilityUser?.department,
        position: user.facilityUser?.position,
        facilityName: user.facilityUser?.facility.name,
      } : null,
    });

  } catch (error) {
    console.error('Error verifying staff:', error);
    return NextResponse.json(
      { isStaff: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}