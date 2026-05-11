import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Fuel, ClipboardList, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react'

async function getStats(userId: string, role: string) {
  if (role === 'DRIVER') {
    const [total, pending, approved, completed, rejected] = await Promise.all([
      prisma.fuelRequest.count({ where: { driverId: userId } }),
      prisma.fuelRequest.count({ where: { driverId: userId, status: 'PENDING' } }),
      prisma.fuelRequest.count({ where: { driverId: userId, status: 'APPROVED' } }),
      prisma.fuelRequest.count({ where: { driverId: userId, status: 'COMPLETED' } }),
      prisma.fuelRequest.count({ where: { driverId: userId, status: 'REJECTED' } }),
    ])
    const recentRequests = await prisma.fuelRequest.findMany({
      where: { driverId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    return { total, pending, approved, completed, rejected, recentRequests }
  }

  if (role === 'ADMIN') {
    const [total, pending, approved, completed, rejected] = await Promise.all([
      prisma.fuelRequest.count(),
      prisma.fuelRequest.count({ where: { status: 'PENDING' } }),
      prisma.fuelRequest.count({ where: { status: 'APPROVED' } }),
      prisma.fuelRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.fuelRequest.count({ where: { status: 'REJECTED' } }),
    ])
    const recentRequests = await prisma.fuelRequest.findMany({
      include: { driver: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    return { total, pending, approved, completed, rejected, recentRequests }
  }

  // ATTENDANT
  const [total, approved, completed] = await Promise.all([
    prisma.fuelRequest.count(),
    prisma.fuelRequest.count({ where: { status: 'APPROVED' } }),
    prisma.fuelRequest.count({ where: { status: 'COMPLETED', attendantId: userId } }),
  ])
  const recentRequests = await prisma.fuelRequest.findMany({
    where: { status: 'APPROVED' },
    include: { driver: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  return { total, pending: approved, approved, completed, rejected: 0, recentRequests }
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      {status}
    </span>
  )
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const role = (session.user as any).role as string
  const userId = (session.user as any).id as string
  const stats = await getStats(userId, role)

  type StatCard = { label: string; value: number; icon: React.ReactNode; color: string }
  const statCardMap: Record<string, StatCard[]> = {
    DRIVER: [
      { label: 'Total Requests', value: stats.total, icon: <ClipboardList size={20} />, color: 'blue' },
      { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: 'orange' },
      { label: 'Approved', value: stats.approved, icon: <CheckCircle size={20} />, color: 'green' },
      { label: 'Completed', value: stats.completed, icon: <Fuel size={20} />, color: 'blue' },
    ],
    ADMIN: [
      { label: 'Total Requests', value: stats.total, icon: <ClipboardList size={20} />, color: 'blue' },
      { label: 'Pending Review', value: stats.pending, icon: <Clock size={20} />, color: 'orange' },
      { label: 'Approved', value: stats.approved, icon: <CheckCircle size={20} />, color: 'green' },
      { label: 'Completed', value: stats.completed, icon: <TrendingUp size={20} />, color: 'purple' },
    ],
    ATTENDANT: [
      { label: 'Awaiting Dispense', value: stats.approved, icon: <Fuel size={20} />, color: 'orange' },
      { label: 'Dispensed by Me', value: stats.completed, icon: <CheckCircle size={20} />, color: 'green' },
      { label: 'Total in System', value: stats.total, icon: <ClipboardList size={20} />, color: 'blue' },
    ],
  }
  const statCards: StatCard[] = statCardMap[role] ?? []

  const greetings: Record<string, string> = {
    DRIVER: 'Submit and track your fuel requests',
    ADMIN: 'Review and manage all fuel requests',
    ATTENDANT: 'Dispense approved fuel requests',
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {session.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">{greetings[role]}</p>
        </div>
        <span className={`badge role-${role.toLowerCase()}`}>{role}</span>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map((s: { label: string; value: number; icon: React.ReactNode; color: string }) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon bg-${s.color}`}>
              <span className={`text-${s.color}`}>{s.icon}</span>
            </div>
            <div className="stat-body">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activity</h2>
        </div>
        {stats.recentRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p>No requests yet</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Fuel Type</th>
                  <th>Amount (L)</th>
                  {role !== 'DRIVER' && <th>Driver</th>}
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentRequests.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.vehiclePlate}</td>
                    <td>{r.fuelType}</td>
                    <td>{r.amount}L</td>
                    {role !== 'DRIVER' && <td>{r.driver?.name ?? '—'}</td>}
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
