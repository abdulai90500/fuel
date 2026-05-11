'use client'

import { useEffect, useState } from 'react'
import { Fuel, CheckCircle, Loader, ClipboardList } from 'lucide-react'
import Toast, { useToast } from '@/components/Toast'

interface FuelRequest {
  id: string
  vehiclePlate: string
  fuelType: string
  amount: number
  status: string
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

export default function DispensePage() {
  const [requests, setRequests] = useState<FuelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const { toasts, addToast, removeToast } = useToast()

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/requests?status=APPROVED&include=driver')
      const data = await res.json()
      setRequests(data)
    } catch {
      addToast('Failed to load requests', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleDispense = async (id: string) => {
    setActionId(id)
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })
      if (!res.ok) throw new Error()
      addToast('Fuel dispensed and marked as completed ✓', 'success')
      await fetchRequests()
    } catch {
      addToast('Failed to mark as dispensed', 'error')
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Dispense Fuel</h1>
          <p className="page-subtitle">Approved requests waiting for fuel dispensing</p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '8px',
            padding: '0.5rem 0.875rem',
            fontSize: '0.875rem',
            color: '#4ade80',
            fontWeight: 600,
          }}
        >
          <Fuel size={16} />
          {requests.length} Ready
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">
            <Loader size={24} className="animate-spin" style={{ color: 'var(--accent-blue-light)' }} />
            <p>Loading approved requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Fuel size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p>No approved requests awaiting dispensing</p>
            <p style={{ fontSize: '0.8rem' }}>Check back once Admin approves requests</p>
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
                  <th>Approved At</th>
                  <th>Action</th>
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
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--accent-green-light)',
                          fontSize: '1rem',
                        }}
                      >
                        {r.amount}L
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {formatDate(r.createdAt)}
                    </td>
                    <td>
                      <button
                        id={`dispense-${r.id}`}
                        className="btn btn-success btn-sm"
                        onClick={() => handleDispense(r.id)}
                        disabled={actionId === r.id}
                      >
                        {actionId === r.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Mark Dispensed
                      </button>
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
