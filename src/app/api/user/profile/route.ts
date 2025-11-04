import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/user/profile - Get current user's medical profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await prisma.medicalProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { message: 'Medical profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching medical profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update current user's medical profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      dateOfBirth,
      bloodType,
      allergies,
      medications,
      conditions,
      emergencyContacts,
    } = body;

    // Helper function to serialize arrays to strings
    const serializeArray = (value: any): string | null => {
      if (!value) return null;
      if (Array.isArray(value)) {
        // Filter out empty strings and serialize to JSON
        const filtered = value.filter(item => item && typeof item === 'string' && item.trim());
        return filtered.length > 0 ? JSON.stringify(filtered) : null;
      }
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
      return null;
    };

    // Handle emergency contacts - for now, keep as simple name/phone fields
    // TODO: Update schema to support multiple contacts as JSON
    const primaryContact = emergencyContacts && emergencyContacts.length > 0 ? emergencyContacts[0] : null;

    const updatedProfile = await prisma.medicalProfile.update({
      where: { userId: session.user.id },
      data: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        bloodType: bloodType || null,
        allergies: serializeArray(allergies),
        medications: medications || null,
        conditions: serializeArray(conditions),
        emergencyContactName: primaryContact?.name || null,
        emergencyContactPhone: primaryContact?.phone || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating medical profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
