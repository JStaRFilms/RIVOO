// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const facilityData = [
  {
    name: 'Lekki Central Clinic',
    address: '15 Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '101245',
    phone: '+234-803-123-4567',
    latitude: 6.4385,
    longitude: 3.4735
  },
  {
    name: 'Mother and Child Hospital',
    address: '20 Bourdillon Road, Ikoyi',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '101233',
    phone: '+234-803-123-4547',
    latitude: 6.4544,
    longitude: 3.4316
  },
  {
    name: 'Ikoyi Specialist Hospital',
    address: '32 Kingsway Road, Ikoyi',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '101233',
    phone: '+234-803-234-5678',
    latitude: 6.4533,
    longitude: 3.4402
  },
  {
    name: 'Ajah Trauma Center',
    address: '45 Lekki-Epe Expressway, Ajah',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '101283',
    phone: '+234-803-345-6789',
    latitude: 6.4300,
    longitude: 3.5850
  }
];

async function main() {
  console.log('🏥 Starting seed process...\n');

  // Clear existing data in correct order
  console.log('Clearing existing data...');
  await prisma.incident.deleteMany({});
  await prisma.facilityUser.deleteMany({});
  await prisma.medicalProfile.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Cleared existing data\n');

  // Create test user
  console.log('Creating test user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.create({
    data: {
      email: 'test@rivoo.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'USER',
      medicalProfile: {
        create: {
          bloodType: 'O+',
          allergies: 'None',
          emergencyContactName: 'Jane Doe',
          emergencyContactPhone: '+234-803-999-8888',
        },
      },
    },
  });
  console.log('✅ Test user created:', testUser.email);

  // Create hospital staff user
  console.log('Creating hospital staff user...');
  const staffPassword = await bcrypt.hash('hospital123', 10);
  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@rivoo.com',
      name: 'Dr. John Doe',
      password: staffPassword,
      role: 'HOSPITAL_STAFF',
    },
  });
  console.log('✅ Hospital staff user created:', staffUser.email);

  console.log('\n--- Seeding Facilities ---');

  const createdFacilities = [];
  for (const f of facilityData) {
    const facility = await prisma.facility.create({
      data: {
        name: f.name,
        address: f.address,
        city: f.city,
        state: f.state,
        postalCode: f.postalCode,
        phone: f.phone,
        latitude: f.latitude,
        longitude: f.longitude,
      },
    });
    createdFacilities.push(facility);
    console.log(`✅ Seeded: ${f.name}`);
  }

  // Link staff user to first facility
  console.log('\nLinking staff to facility...');
  const facilityUserLink = await prisma.facilityUser.create({
    data: {
      facilityId: createdFacilities[0].id,
      userId: staffUser.id,
      staffId: 'HOSP-12345',
      role: 'DOCTOR',
      department: 'Emergency',
      position: 'ER Lead Physician',
    },
  });
  console.log('✅ Staff linked to', createdFacilities[0].name);

  console.log('\n--- Seeding Test Incidents ---');

  // Create test incidents with different statuses
  const testIncidents = [
    {
      description: 'Chest pain and difficulty breathing',
      locationLat: 6.4400,
      locationLng: 3.4750,
      address: '12 Admiralty Way, Lekki',
      priority: 'CRITICAL' as const,
      status: 'PENDING' as const,
    },
    {
      description: 'Severe abdominal pain',
      locationLat: 6.4500,
      locationLng: 3.4450,
      address: '45 Kingsway Road, Ikoyi',
      priority: 'HIGH' as const,
      status: 'PENDING' as const,
    },
    {
      description: 'Minor injury - ankle sprain',
      locationLat: 6.4350,
      locationLng: 3.5200,
      address: '78 Lekki-Epe Expressway',
      priority: 'MEDIUM' as const,
      status: 'PENDING' as const,
    },
    {
      description: 'Headache and fever',
      locationLat: 6.4420,
      locationLng: 3.4680,
      address: '34 Victoria Island',
      priority: 'LOW' as const,
      status: 'PENDING' as const,
    },
    {
      description: 'Patient in transit - car accident',
      locationLat: 6.4385,
      locationLng: 3.4735,
      address: '15 Admiralty Way',
      priority: 'HIGH' as const,
      status: 'ASSIGNED' as const,
      facilityId: createdFacilities[0].id,
      assignedToId: facilityUserLink.id,
    },
  ];

  for (const incident of testIncidents) {
    await prisma.incident.create({
      data: {
        userId: testUser.id,
        status: incident.status,
        priority: incident.priority,
        locationLat: incident.locationLat,
        locationLng: incident.locationLng,
        address: incident.address,
        description: incident.description,
        facilityId: incident.facilityId,
        assignedToId: incident.assignedToId,
        alertSource: 'USER',
      },
    });
    console.log(`✅ Created: ${incident.description} (${incident.status})`);
  }

  console.log('\n✨ Seeding complete!');
  console.log('📊 Summary:');
  console.log(`   - Facilities: ${facilityData.length}`);
  console.log(`   - Test Incidents: ${testIncidents.length}`);
  console.log(`   - Test User: ${testUser.email} (password: password123)`);
  console.log(`   - Staff User: ${staffUser.email} (password: hospital123)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });