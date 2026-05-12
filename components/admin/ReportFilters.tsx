'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ReportFiltersProps {
  drivers: { id: string; name: string | null }[]
}

export default function ReportFilters({ drivers }: ReportFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPeriod = searchParams.get('period') || 'all'
  const currentDriver = searchParams.get('driverId') || 'all'

  const periods = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'daily' },
    { label: 'This Week', value: 'weekly' },
    { label: 'This Month', value: 'monthly' },
    { label: 'This Year', value: 'yearly' },
  ]

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
      <div className="flex gap-1 bg-secondary p-1 rounded-lg border border-color">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => handleFilter('period', p.value)}
            className={`btn btn-sm ${currentPeriod === p.value ? 'btn-primary' : 'btn-ghost'}`}
            style={{ 
              border: 'none',
              fontSize: '0.75rem',
              padding: '0.4rem 0.8rem'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <select 
        className="form-control" 
        style={{ width: 'auto', fontSize: '0.75rem', padding: '0.4rem 2rem 0.4rem 0.8rem' }}
        value={currentDriver}
        onChange={(e) => handleFilter('driverId', e.target.value)}
      >
        <option value="all">All Drivers</option>
        {drivers.map(d => (
          <option key={d.id} value={d.id}>{d.name || 'Unknown Driver'}</option>
        ))}
      </select>
    </div>
  )
}
