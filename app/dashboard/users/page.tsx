import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Users } from 'lucide-react'

const roleColors: Record<string, string> = {
  DRIVER: 'role-driver',
  ADMIN: 'role-admin',
  ATTENDANT: 'role-attendant',
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as any).role
  if (role !== 'ADMIN') redirect('/dashboard')

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { requests: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      {/* Role summary */}
      <div className="stat-grid" style={{ marginBottom: '1.25rem' }}>
        {(['DRIVER', 'ADMIN', 'ATTENDANT'] as const).map((r) => {
          const count = users.filter((u) => u.role === r).length
          return (
            <div key={r} className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Users size={20} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className="stat-body">
                <div className="stat-value">{count}</div>
                <div className="stat-label">{r.charAt(0) + r.slice(1).toLowerCase()}s</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p>No users found</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ borderRadius: '12px' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Requests</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.07)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          {(u.name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name ?? '—'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${roleColors[u.role]}`}>{u.role}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{u._count.requests}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {formatDate(u.createdAt)}
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
