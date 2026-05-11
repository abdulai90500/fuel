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
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function AttendantLogPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as any).role
  if (role !== 'ATTENDANT') redirect('/dashboard')
  const userId = (session.user as any).id

  const requests = await prisma.fuelRequest.findMany({
    where: { status: 'COMPLETED', attendantId: userId },
    include: { driver: { select: { name: true, email: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  const totalLitres = requests.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dispense Log</h1>
          <p className="page-subtitle">Fuel you have dispensed</p>
        </div>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card">
          <div className="stat-icon bg-green">
            <span className="text-green">
              <ClipboardList size={20} />
            </span>
          </div>
          <div className="stat-body">
            <div className="stat-value">{requests.length}</div>
            <div className="stat-label">Total Dispensed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <span className="text-blue">⛽</span>
          </div>
          <div className="stat-body">
            <div className="stat-value">{totalLitres}L</div>
            <div className="stat-label">Total Litres</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p>No dispensed fuel yet</p>
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
                  <th>Dispensed At</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.driver?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.driver?.email}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.vehiclePlate}</td>
                    <td>{r.fuelType}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-green-light)' }}>
                      {r.amount}L
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {formatDate(r.updatedAt)}
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
