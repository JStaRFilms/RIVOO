import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GeoJSON uses coordinates: [longitude, latitude]
const facilityData = [
  {
    name: 'Lekki Central Clinic',
    address: '15 Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '101245',
    phone: '+234-803-123-4567',
    coords: [3.4735, 6.4385] // [lng, lat]
  },
  {
    name: 'Ikoyi Specialist Hospital',
    address: '32 Kingsway Road, Ikoyi',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '101233',
    phone: '+234-803-234-5678',
    coords: [3.4402, 6.4533]
  },
  {
    name: 'Ajah Trauma Center',
    address: '45 Lekki-Epe Expressway, Ajah',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '101283',
    phone: '+234-803-345-6789',
    coords: [3.5850, 6.4300]
  }
];

async function main() {
  console.log('🏥 Starting seed process...\n');

  // Ensure we have at least one user for foreign key constraints
  let testUser = await prisma.user.findFirst();
  
  if (!testUser) {
    console.log('Creating test user...');
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password_here', // In production, use proper hashing
        role: 'USER',
      },
    });
    console.log('✅ Test user created\n');
  }

  console.log('--- Seeding Facilities ---');

  // Clear existing facilities
  await prisma.facility.deleteMany({});
  console.log('Cleared existing facilities');

  // Use raw SQL to insert facilities with PostGIS data
  for (const f of facilityData) {
    await prisma.$executeRaw`
      INSERT INTO facilities (id, name, address, city, state, postal_code, phone, location, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${f.name},
        ${f.address},
        ${f.city},
        ${f.state},
        ${f.postalCode},
        ${f.phone},
        ST_SetSRID(ST_MakePoint(${f.coords[0]}, ${f.coords[1]}), 4326)::geography,
        NOW(),
        NOW()
      )
      ON CONFLICT (name) DO UPDATE SET
        address = EXCLUDED.address,
        location = EXCLUDED.location,
        updated_at = NOW()
    `;
    console.log(`✅ Seeded: ${f.name}`);
  }

  console.log('\n--- Seeding Test Incidents ---');

  // Clear existing test incidents
  await prisma.incident.deleteMany({
    where: {
      description: {
        contains: 'Test Incident'
      }
    }
  });
  console.log('Cleared existing test incidents');

  // Create some test incidents at different locations
  const testIncidents = [
    {
      description: 'Test Incident - Near Lekki Central',
      lat: 6.4400,
      lng: 3.4750,
      priority: 'HIGH' as const,
    },
    {
      description: 'Test Incident - Near Ikoyi Hospital',
      lat: 6.4500,
      lng: 3.4450,
      priority: 'MEDIUM' as const,
    },
    {
      description: 'Test Incident - Near Ajah Center',
      lat: 6.4350,
      lng: 3.5200,
      priority: 'CRITICAL' as const,
    },
  ];

  for (const incident of testIncidents) {
    await prisma.incident.create({
      data: {
        userId: testUser.id,
        status: 'PENDING',
        priority: incident.priority,
        locationLat: incident.lat,
        locationLng: incident.lng,
        description: incident.description,
      },
    });
    console.log(`✅ Created: ${incident.description}`);
  }

  console.log('\n✨ Seeding complete!');
  console.log('📊 Summary:');
  console.log(`   - Facilities: ${facilityData.length}`);
  console.log(`   - Test Incidents: ${testIncidents.length}`);
  console.log(`   - Test User: ${testUser.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });