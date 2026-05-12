'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader, ClipboardList, Clock, Download, Printer } from 'lucide-react'
import Toast, { useToast } from '@/components/Toast'
import StatusBadge from '@/components/dashboard/StatusBadge'

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
  const [timeframe, setTimeframe] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL')
  const [actionId, setActionId] = useState<string | null>(null)
  const [editedAmounts, setEditedAmounts] = useState<Record<string, number>>({})
  const { toasts, addToast, removeToast } = useToast()

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/requests?include=driver')
      const data = await res.json()
      setRequests(data)
      
      // Initialize edited amounts
      const initial: Record<string, number> = {}
      data.forEach((r: FuelRequest) => {
        initial[r.id] = r.amount
      })
      setEditedAmounts(initial)
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
        body: JSON.stringify({ 
          action,
          amount: action === 'approve' ? editedAmounts[id] : undefined
        }),
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

  const exportToCSV = () => {
    const headers = ['Driver', 'Vehicle', 'Fuel Type', 'Amount', 'Status', 'Date']
    const rows = filtered.map(r => [
      r.driver?.name || 'Unknown',
      r.vehiclePlate,
      r.fuelType,
      r.amount,
      r.status,
      new Date(r.createdAt).toLocaleString()
    ])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', `approvals_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
  }

  const filtered = requests.filter((r) => {
    const statusMatch = filter === 'ALL' ? true : r.status === filter
    
    if (!statusMatch) return false

    if (timeframe === 'ALL') return true
    
    const d = new Date(r.createdAt)
    const now = new Date()
    if (timeframe === 'TODAY') {
      return d.toDateString() === now.toDateString()
    }
    if (timeframe === 'WEEK') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7))
      return d >= weekAgo
    }
    if (timeframe === 'MONTH') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    return true
  })

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.status === 'PENDING').length,
    APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
    REJECTED: requests.filter((r) => r.status === 'REJECTED').length,
    COMPLETED: requests.filter((r) => r.status === 'COMPLETED').length,
  }

  return (
    <>
      <style>{`
        @media print {
          .sidebar, .topbar, .no-print { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .page-content { padding: 0 !important; }
          .card { border: none !important; box-shadow: none !important; }
        }
      `}</style>
      
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel Approvals</h1>
          <p className="page-subtitle">Review and approve or reject driver requests</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={exportToCSV} className="btn btn-ghost btn-sm">
            <Download size={16} />
            CSV
          </button>
          <button onClick={() => window.print()} className="btn btn-primary btn-sm">
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      <div className="flex justify-between items-end mb-4 no-print" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        {/* Status Tabs */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Status</label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: filter === s ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: filter === s ? 'rgba(59,130,246,0.1)' : 'var(--bg-card)',
                  color: filter === s ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Filter */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Timeframe</label>
          <select 
            className="form-control" 
            style={{ width: 'auto', fontSize: '0.75rem', padding: '0.35rem 2rem 0.35rem 0.75rem' }}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">This Month</option>
          </select>
        </div>
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
            <p>No {filter === 'ALL' ? '' : filter.toLowerCase()} requests found</p>
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
                  <th className="no-print">Action</th>
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
                    <td>
                      {r.status === 'PENDING' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input 
                            type="number" 
                            className="form-control" 
                            style={{ width: '70px', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            value={editedAmounts[r.id] ?? r.amount}
                            onChange={(e) => setEditedAmounts({...editedAmounts, [r.id]: Number(e.target.value)})}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>L</span>
                        </div>
                      ) : (
                        <span>{r.amount}L</span>
                      )}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="no-print">
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
