'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader, ClipboardList, Clock } from 'lucide-react'
import Toast, { useToast } from '@/components/Toast'

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

interface FuelRequest {
  id: string
  vehiclePlate: string
  fuelType: string
  amount: number
  status: RequestStatus
  createdAt: string
  driver: { name: string; email: string }
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<FuelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('PENDING')
  const [actionId, setActionId] = useState<string | null>(null)
  const { toasts, addToast, removeToast } = useToast()

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/requests?include=driver')
      const data = await res.json()
      setRequests(data)
    } catch {
      addToast('Failed to load requests', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionId(id)
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      addToast(`Request ${action}d successfully`, 'success')
      await fetchRequests()
    } catch {
      addToast(`Failed to ${action} request`, 'error')
    } finally {
      setActionId(null)
    }
  }

  const filtered = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter)

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.status === 'PENDING').length,
    APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
    REJECTED: requests.filter((r) => r.status === 'REJECTED').length,
    COMPLETED: requests.filter((r) => r.status === 'COMPLETED').length,
  }

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel Approvals</h1>
          <p className="page-subtitle">Review and approve or reject driver requests</p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(234,179,8,0.1)',
            border: '1px solid rgba(234,179,8,0.2)',
            borderRadius: '8px',
            padding: '0.5rem 0.875rem',
            fontSize: '0.875rem',
            color: '#fbbf24',
            fontWeight: 600,
          }}
        >
          <Clock size={16} />
          {counts.PENDING} Pending
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: '9999px',
              border: filter === s ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--border-color)',
              background: filter === s ? 'rgba(59,130,246,0.12)' : 'transparent',
              color: filter === s ? 'var(--accent-blue-light)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">
            <Loader size={24} className="animate-spin" style={{ color: 'var(--accent-blue-light)' }} />
            <p>Loading requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p>No {filter === 'ALL' ? '' : filter.toLowerCase()} requests</p>
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
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.driver?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.driver?.email}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.vehiclePlate}</td>
                    <td>{r.fuelType}</td>
                    <td>{r.amount}L</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {formatDate(r.createdAt)}
                    </td>
                    <td>
                      {r.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAction(r.id, 'approve')}
                            disabled={actionId === r.id}
                          >
                            {actionId === r.id ? (
                              <Loader size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleAction(r.id, 'reject')}
                            disabled={actionId === r.id}
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
