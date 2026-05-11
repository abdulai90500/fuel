import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH /api/requests/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (session.user as any).role
    const userId = (session.user as any).id
    const { id } = await params
    const body = await req.json()
    const { action } = body

    // Verify request exists
    const existing = await prisma.fuelRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // ADMIN: approve or reject
    if (action === 'approve' || action === 'reject') {
      if (role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only admins can approve/reject' }, { status: 403 })
      }
      if (existing.status !== 'PENDING') {
        return NextResponse.json({ error: 'Request is no longer pending' }, { status: 400 })
      }

      const updated = await prisma.fuelRequest.update({
        where: { id },
        data: {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          adminId: userId,
        },
      })
      return NextResponse.json(updated)
    }

    // ATTENDANT: mark as completed (dispensed)
    if (action === 'complete') {
      if (role !== 'ATTENDANT') {
        return NextResponse.json({ error: 'Only attendants can dispense fuel' }, { status: 403 })
      }
      if (existing.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Request must be approved first' }, { status: 400 })
      }

      const updated = await prisma.fuelRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          attendantId: userId,
        },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[PATCH /api/requests/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/requests/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const request = await prisma.fuelRequest.findUnique({
      where: { id: resolvedParams.id },
      include: {
        driver: { select: { name: true, email: true } },
        admin: { select: { name: true } },
        attendant: { select: { name: true } },
      },
    })

    if (!request) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(request)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
