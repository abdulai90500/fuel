import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password with 10 rounds
  const password = await bcrypt.hash('password123', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fuel.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@fuel.com',
      password,
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin created: ${admin.email}`)

  // Create Attendant
  const attendant = await prisma.user.upsert({
    where: { email: 'attendant@fuel.com' },
    update: {},
    create: {
      name: 'John Attendant',
      email: 'attendant@fuel.com',
      password,
      role: 'ATTENDANT',
    },
  })
  console.log(`✅ Attendant created: ${attendant.email}`)

  // Create Drivers
  const driver1 = await prisma.user.upsert({
    where: { email: 'driver@fuel.com' },
    update: {},
    create: {
      name: 'James Driver',
      email: 'driver@fuel.com',
      password,
      role: 'DRIVER',
    },
  })
  console.log(`✅ Driver created: ${driver1.email}`)

  const driver2 = await prisma.user.upsert({
    where: { email: 'amara@fuel.com' },
    update: {},
    create: {
      name: 'Amara Kamara',
      email: 'amara@fuel.com',
      password,
      role: 'DRIVER',
    },
  })
  console.log(`✅ Driver 2 created: ${driver2.email}`)

  // Create sample fuel requests
  const req1 = await prisma.fuelRequest.create({
    data: {
      vehiclePlate: 'SL-1234',
      fuelType: 'Diesel',
      amount: 50,
      status: 'COMPLETED',
      driverId: driver1.id,
      adminId: admin.id,
      attendantId: attendant.id,
    },
  })

  const req2 = await prisma.fuelRequest.create({
    data: {
      vehiclePlate: 'SL-5678',
      fuelType: 'Petrol',
      amount: 30,
      status: 'APPROVED',
      driverId: driver2.id,
      adminId: admin.id,
    },
  })

  const req3 = await prisma.fuelRequest.create({
    data: {
      vehiclePlate: 'SL-1234',
      fuelType: 'Premium Petrol',
      amount: 45,
      status: 'PENDING',
      driverId: driver1.id,
    },
  })

  const req4 = await prisma.fuelRequest.create({
    data: {
      vehiclePlate: 'SL-9999',
      fuelType: 'Diesel',
      amount: 60,
      status: 'REJECTED',
      driverId: driver2.id,
      adminId: admin.id,
    },
  })

  console.log(`✅ Sample fuel requests created (${[req1, req2, req3, req4].length})`)

  console.log('\n🎉 Seed complete!')
  console.log('\n📋 Demo login credentials (all use password: password123):')
  console.log('  Admin     → admin@fuel.com')
  console.log('  Driver    → driver@fuel.com')
  console.log('  Attendant → attendant@fuel.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
