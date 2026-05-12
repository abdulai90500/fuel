import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { History, FileText } from 'lucide-react'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ExportActions from '@/components/admin/ExportActions'
import ReportFilters from '@/components/admin/ReportFilters'

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; driverId?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as any).role
  if (role !== 'ADMIN') redirect('/dashboard')

  const { period, driverId } = await searchParams
  
  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER' },
    select: { id: true, name: true }
  })

  const now = new Date()
  let dateFilter = {}
  
  if (period === 'daily') {
    const start = new Date(now.setHours(0,0,0,0))
    dateFilter = { gte: start }
  } else if (period === 'weekly') {
    const start = new Date(now.setDate(now.getDate() - now.getDay()))
    start.setHours(0,0,0,0)
    dateFilter = { gte: start }
  } else if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    dateFilter = { gte: start }
  } else if (period === 'yearly') {
    const start = new Date(now.getFullYear(), 0, 1)
    dateFilter = { gte: start }
  }

  const requests = await prisma.fuelRequest.findMany({
    where: {
      createdAt: dateFilter,
      driverId: driverId || undefined
    },
    include: {
      driver: { select: { name: true, email: true } },
      admin: { select: { name: true } },
      attendant: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalLitres = requests
    .filter((r) => r.status === 'COMPLETED')
    .reduce((s, r) => s + r.amount, 0)

  return (
    <div className="report-container">
      <style>{`
        @media print {
          .sidebar, .topbar, .report-filters, .btn, .no-print { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .page-content { padding: 0 !important; }
          .card { border: none !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel Audit Reports</h1>
          <p className="page-subtitle">Generate and export fuel consumption records</p>
        </div>
        <div className="no-print">
          <ExportActions data={requests} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-4 no-print report-filters" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <ReportFilters drivers={drivers} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Showing {requests.length} records
        </span>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Requests', value: requests.length, color: 'blue' },
          { label: 'Completed', value: requests.filter((r) => r.status === 'COMPLETED').length, color: 'green' },
          { label: 'Total Litres', value: `${totalLitres}L`, color: 'orange' },
          { label: 'Rejected', value: requests.filter((r) => r.status === 'REJECTED').length, color: 'red' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon bg-${s.color}`}>
              <FileText size={20} className={`text-${s.color}`} />
            </div>
            <div className="stat-body">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <History size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p>No records found for this period</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ borderRadius: '12px' }}>
            <table>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Fuel Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Approved By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.driver?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.driver?.email}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.vehiclePlate}</td>
                    <td>{r.fuelType}</td>
                    <td>{r.amount}L</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.admin?.name ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
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
