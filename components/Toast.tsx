'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
}

interface ToastProps {
  toasts: ToastMessage[]
  removeToast: (id: string) => void
}

const icons = {
  success: <CheckCircle size={18} style={{ color: 'var(--accent-green-light)' }} />,
  error: <XCircle size={18} style={{ color: '#f87171' }} />,
  info: <Info size={18} style={{ color: 'var(--accent-blue-light)' }} />,
}

export default function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000)
    return () => clearTimeout(timer)
  }, [onRemove])

  return (
    <div className={`toast toast-${toast.type}`}>
      {icons[toast.type]}
      <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
        {toast.message}
      </span>
      <button
        onClick={onRemove}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '2px',
          display: 'flex',
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

// Hook for easy toast usage
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
