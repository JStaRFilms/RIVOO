import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords
  const defaultPassword = await hash('password123', 10);
  const hospitalPassword = await hash('hospital123', 10);

  // Create a hospital/facility
  console.log('🏥 Creating hospital...');
  const hospital = await prisma.facility.upsert({
    where: { id: 'hospital-1' },
    update: {},
    create: {
      id: 'hospital-1',
      name: 'City General Hospital',
      address: '123 Medical Center Drive',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'US',
      phone: '(555) 123-4567',
      email: 'info@citygeneral.com',
      website: 'https://citygeneral.com',
      latitude: 39.7817,
      longitude: -89.6501,
    },
  });

  // Create hospital staff users
  console.log('👨‍⚕️ Creating hospital staff...');

  // Hospital Admin
  const hospitalAdmin = await prisma.user.upsert({
    where: { email: 'admin@citygeneral.com' },
    update: {},
    create: {
      email: 'admin@citygeneral.com',
      name: 'Dr. Sarah Johnson',
      password: hospitalPassword,
      role: 'HOSPITAL_STAFF',
    },
  });

  await prisma.facilityUser.upsert({
    where: { staffId: 'HOSP-00001' },
    update: {},
    create: {
      facilityId: hospital.id,
      userId: hospitalAdmin.id,
      staffId: 'HOSP-00001',
      role: 'ADMIN',
      department: 'Administration',
      position: 'Chief of Staff',
    },
  });

  // Emergency Doctor
  const emergencyDoctor = await prisma.user.upsert({
    where: { email: 'dr.smith@citygeneral.com' },
    update: {},
    create: {
      email: 'dr.smith@citygeneral.com',
      name: 'Dr. Michael Smith',
      password: hospitalPassword,
      role: 'HOSPITAL_STAFF',
    },
  });

  await prisma.facilityUser.upsert({
    where: { staffId: 'HOSP-00002' },
    update: {},
    create: {
      facilityId: hospital.id,
      userId: emergencyDoctor.id,
      staffId: 'HOSP-00002',
      role: 'DOCTOR',
      department: 'Emergency Medicine',
      position: 'ER Physician',
    },
  });

  // Nurse
  const nurse = await prisma.user.upsert({
    where: { email: 'nurse.davis@citygeneral.com' },
    update: {},
    create: {
      email: 'nurse.davis@citygeneral.com',
      name: 'Nurse Emily Davis',
      password: hospitalPassword,
      role: 'HOSPITAL_STAFF',
    },
  });

  await prisma.facilityUser.upsert({
    where: { staffId: 'HOSP-00003' },
    update: {},
    create: {
      facilityId: hospital.id,
      userId: nurse.id,
      staffId: 'HOSP-00003',
      role: 'NURSE',
      department: 'Emergency Department',
      position: 'ER Nurse',
    },
  });

  // Regular staff member
  const staffMember = await prisma.user.upsert({
    where: { email: 'staff.wilson@citygeneral.com' },
    update: {},
    create: {
      email: 'staff.wilson@citygeneral.com',
      name: 'John Wilson',
      password: hospitalPassword,
      role: 'HOSPITAL_STAFF',
    },
  });

  await prisma.facilityUser.upsert({
    where: { staffId: 'HOSP-00004' },
    update: {},
    create: {
      facilityId: hospital.id,
      userId: staffMember.id,
      staffId: 'HOSP-00004',
      role: 'STAFF',
      department: 'Emergency Department',
      position: 'Medical Assistant',
    },
  });

  // Create regular users
  console.log('👥 Creating regular users...');

  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@email.com' },
    update: {},
    create: {
      email: 'john.doe@email.com',
      name: 'John Doe',
      password: defaultPassword,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@email.com' },
    update: {},
    create: {
      email: 'jane.smith@email.com',
      name: 'Jane Smith',
      password: defaultPassword,
      role: 'USER',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'mike.johnson@email.com' },
    update: {},
    create: {
      email: 'mike.johnson@email.com',
      name: 'Mike Johnson',
      password: defaultPassword,
      role: 'USER',
    },
  });

  // Create medical profiles for users
  console.log('📋 Creating medical profiles...');

  await prisma.medicalProfile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      dateOfBirth: new Date('1985-03-15'),
      bloodType: 'O+',
      allergies: 'Penicillin',
      medications: 'Lisinopril 10mg daily',
      emergencyContactName: 'Mary Doe',
      emergencyContactPhone: '(555) 987-6543',
    },
  });

  await prisma.medicalProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      dateOfBirth: new Date('1990-07-22'),
      bloodType: 'A-',
      allergies: 'None',
      medications: 'None',
      emergencyContactName: 'Robert Smith',
      emergencyContactPhone: '(555) 456-7890',
    },
  });

  // Create sample incidents
  console.log('🚨 Creating sample incidents...');

  await prisma.incident.createMany({
    data: [
      {
        userId: user1.id,
        facilityId: hospital.id,
        status: 'RESOLVED',
        priority: 'HIGH',
        locationLat: 39.7817,
        locationLng: -89.6501,
        address: '456 Oak Street, Springfield, IL',
        description: 'Chest pain and difficulty breathing',
        notes: 'Patient stabilized and discharged after treatment',
        acceptedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        resolvedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        userId: user2.id,
        status: 'ASSIGNED',
        priority: 'CRITICAL',
        locationLat: 39.7917,
        locationLng: -89.6401,
        address: '789 Pine Avenue, Springfield, IL',
        description: 'Severe allergic reaction - difficulty breathing',
        notes: 'Ambulance dispatched, patient conscious but distressed',
        acceptedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        userId: user3.id,
        facilityId: hospital.id,
        status: 'PENDING',
        priority: 'MEDIUM',
        locationLat: 39.7717,
        locationLng: -89.6601,
        address: '321 Elm Drive, Springfield, IL',
        description: 'Possible broken arm after fall',
        notes: 'Awaiting triage assessment',
      },
    ],
  });

  // Assign incidents to staff
  const incidents = await prisma.incident.findMany({
    where: { status: 'ASSIGNED' },
  });

  if (incidents.length > 0) {
    // Find the facility user record for the emergency doctor
    const facilityUser = await prisma.facilityUser.findFirst({
      where: { userId: emergencyDoctor.id },
    });

    if (facilityUser) {
      await prisma.incident.update({
        where: { id: incidents[0].id },
        data: { assignedToId: facilityUser.id },
      });
    }
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`🏥 Hospitals: 1 (${hospital.name})`);
  console.log('👨‍⚕️ Hospital Staff: 4 users created');
  console.log('👥 Regular Users: 3 users created');
  console.log('📋 Medical Profiles: 2 profiles created');
  console.log('🚨 Sample Incidents: 3 incidents created');

  console.log('\n🔐 Login Credentials:');
  console.log('\nHospital Staff (use /hospital/login):');
  console.log('• Admin: HOSP-00001 / hospital123');
  console.log('• Doctor: HOSP-00002 / hospital123');
  console.log('• Nurse: HOSP-00003 / hospital123');
  console.log('• Staff: HOSP-00004 / hospital123');

  console.log('\nRegular Users (use /auth/signin):');
  console.log('• john.doe@email.com / password123');
  console.log('• jane.smith@email.com / password123');
  console.log('• mike.johnson@email.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
