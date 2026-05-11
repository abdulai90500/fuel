import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ClipboardList } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function MyRequestsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = (session.user as any).id
  const role = (session.user as any).role
  if (role !== 'DRIVER') redirect('/dashboard')

  const requests = await prisma.fuelRequest.findMany({
    where: { driverId: userId },
    orderBy: { createdAt: 'desc' },
  })

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Requests</h1>
          <p className="page-subtitle">Track all your fuel request history</p>
        </div>
        <a href="/dashboard/request" className="btn btn-primary">
          + New Request
        </a>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { label: 'All', value: counts.total, cls: '' },
          { label: 'Pending', value: counts.pending, cls: 'badge-pending' },
          { label: 'Approved', value: counts.approved, cls: 'badge-approved' },
          { label: 'Completed', value: counts.completed, cls: 'badge-completed' },
          { label: 'Rejected', value: counts.rejected, cls: 'badge-rejected' },
        ].map((p) => (
          <span
            key={p.label}
            className={`badge ${p.cls}`}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
          >
            {p.label}: {p.value}
          </span>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p>No requests yet</p>
            <a href="/dashboard/request" className="btn btn-primary btn-sm">
              Submit your first request
            </a>
          </div>
        ) : (
          <div className="table-wrap" style={{ borderRadius: '12px' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle</th>
                  <th>Fuel Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {requests.length - i}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.vehiclePlate}</td>
                    <td>{r.fuelType}</td>
                    <td>{r.amount}L</td>
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
