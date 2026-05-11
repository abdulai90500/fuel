import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/requests
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const includeDriver = searchParams.get('include') === 'driver'
    const statusFilter = searchParams.get('status')

    const role = (session.user as any).role
    const userId = (session.user as any).id

    let where: any = {}

    if (role === 'DRIVER') {
      where.driverId = userId
    }

    if (statusFilter) {
      where.status = statusFilter
    }

    const requests = await prisma.fuelRequest.findMany({
      where,
      include: includeDriver
        ? { driver: { select: { name: true, email: true } } }
        : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('[GET /api/requests]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/requests
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (session.user as any).role
    if (role !== 'DRIVER') {
      return NextResponse.json({ error: 'Only drivers can submit requests' }, { status: 403 })
    }

    const body = await req.json()
    const { vehiclePlate, fuelType, amount } = body

    if (!vehiclePlate || !fuelType || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0 || amount > 1000) {
      return NextResponse.json({ error: 'Amount must be between 1 and 1000 litres' }, { status: 400 })
    }

    const userId = (session.user as any).id

    const request = await prisma.fuelRequest.create({
      data: {
        vehiclePlate: vehiclePlate.toUpperCase(),
        fuelType,
        amount: Number(amount),
        driverId: userId,
      },
    })

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error('[POST /api/requests]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
