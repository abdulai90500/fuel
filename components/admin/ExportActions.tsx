'use client'

import { Download, Printer } from 'lucide-react'

interface ExportActionsProps {
  data: any[]
}

export default function ExportActions({ data }: ExportActionsProps) {
  const exportToCSV = () => {
    const headers = ['Driver', 'Email', 'Vehicle', 'Fuel Type', 'Amount', 'Status', 'Approved By', 'Dispensed By', 'Date']
    const rows = data.map(r => [
      r.driver?.name || 'Unknown',
      r.driver?.email || 'N/A',
      r.vehiclePlate,
      r.fuelType,
      r.amount,
      r.status,
      r.admin?.name || '—',
      r.attendant?.name || '—',
      new Date(r.createdAt).toLocaleString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `fuel_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex gap-2">
      <button onClick={exportToCSV} className="btn btn-ghost btn-sm">
        <Download size={16} />
        Export CSV
      </button>
      <button onClick={handlePrint} className="btn btn-primary btn-sm">
        <Printer size={16} />
        Print PDF
      </button>
    </div>
  )
}
