'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import Toast from '@/components/Toast'
import { Fuel, Loader, FilePlus } from 'lucide-react'

const FUEL_TYPES = ['Petrol', 'Diesel', 'Premium Petrol']

export default function NewRequestPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [form, setForm] = useState({
    vehiclePlate: '',
    fuelType: 'Diesel',
    amount: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vehiclePlate || !form.amount) {
      addToast('Please fill all required fields', 'error')
      return
    }
    if (Number(form.amount) <= 0) {
      addToast('Amount must be greater than 0', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehiclePlate: form.vehiclePlate.toUpperCase(),
          fuelType: form.fuelType,
          amount: Number(form.amount),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to submit request')
      }

      addToast('Fuel request submitted successfully! ✓', 'success')
      setTimeout(() => router.push('/dashboard/my-requests'), 1500)
    } catch (err: any) {
      addToast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ maxWidth: 560 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">New Fuel Request</h1>
            <p className="page-subtitle">Submit a request to refuel your vehicle</p>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: 'rgba(59,130,246,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FilePlus size={20} style={{ color: 'var(--accent-blue-light)' }} />
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="vehiclePlate">
                Vehicle Plate Number *
              </label>
              <input
                id="vehiclePlate"
                name="vehiclePlate"
                type="text"
                className="form-control"
                placeholder="e.g. ABC-1234"
                value={form.vehiclePlate}
                onChange={handleChange}
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fuelType">
                Fuel Type *
              </label>
              <select
                id="fuelType"
                name="fuelType"
                className="form-control"
                value={form.fuelType}
                onChange={handleChange}
                required
              >
                {FUEL_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                Amount (Litres) *
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                className="form-control"
                placeholder="e.g. 40"
                value={form.amount}
                onChange={handleChange}
                min="1"
                max="500"
                required
              />
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </button>
              <button
                id="submit-request"
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Fuel size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
