import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ✅ GET — Fetch user medical profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('❌ Unauthorized: no session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.medicalProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        bloodType: true,
        allergies: true,
        conditions: true,
        medications: true,
        emergencyContactPhone: true,
        emergencyContactName: true,
      },
    });

    if (!profile) {
      console.warn('⚠️ No medical profile found for user:', session.user.id);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('🔥 Error fetching medical profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// ✅ POST — Create or update user medical profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('❌ Unauthorized: no session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🧠 Received body:', body);

    const {
      bloodType,
      allergies,
      conditions,
      medication,
      emergencyContactPhone,
      emergencyContactName,
    } = body;

    // ✅ Validation
    if (!bloodType || !emergencyContactPhone || !emergencyContactName) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Blood type and emergency contact are required' },
        { status: 400 }
      );
    }

    // ✅ Create or update the user's medical profile
    const updatedProfile = await prisma.medicalProfile.upsert({
      where: { userId: session.user.id },
      update: {
        bloodType,
        allergies: allergies || 'None',
        medications: medication || 'None',
        conditions: conditions || 'None',
        emergencyContactPhone,
        emergencyContactName,
      },
      create: {
        userId: session.user.id,
        bloodType,
        allergies: allergies || 'None',
        medications: medication || 'None',
        conditions: conditions || 'None',
        emergencyContactPhone,
        emergencyContactName,
      },
    });

    console.log('✅ Profile updated:', updatedProfile);

    // If your User model has this column, you can safely uncomment:
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: { profileComplete: true },
    // });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('🔥 SERVER ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
