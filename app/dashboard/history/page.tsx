import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { History } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as any).role
  if (role !== 'ADMIN') redirect('/dashboard')

  const requests = await prisma.fuelRequest.findMany({
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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Full History</h1>
          <p className="page-subtitle">Complete audit trail of all fuel requests</p>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {requests.length} total records
        </span>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Requests', value: requests.length, color: 'blue' },
          { label: 'Completed', value: requests.filter((r) => r.status === 'COMPLETED').length, color: 'green' },
          { label: 'Total Litres Dispensed', value: `${totalLitres}L`, color: 'orange' },
          { label: 'Rejected', value: requests.filter((r) => r.status === 'REJECTED').length, color: 'red' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon bg-${s.color}`}>
              <History size={20} className={`text-${s.color}`} />
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
            <p>No records yet</p>
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
                  <th>Dispensed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.driver?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {r.driver?.email}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.vehiclePlate}</td>
                    <td>{r.fuelType}</td>
                    <td>{r.amount}L</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.admin?.name ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.attendant?.name ?? '—'}</td>
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
