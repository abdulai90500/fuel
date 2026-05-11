'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  CheckCircle,
  Users,
  History,
  Fuel,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const roleColors: Record<string, string> = {
  DRIVER: '#c084fc',
  ADMIN: '#f87171',
  ATTENDANT: '#4ade80',
}

const roleBg: Record<string, string> = {
  DRIVER: 'rgba(168,85,247,0.15)',
  ADMIN: 'rgba(239,68,68,0.15)',
  ATTENDANT: 'rgba(34,197,94,0.15)',
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    roles: ['DRIVER', 'ADMIN', 'ATTENDANT'],
  },
  {
    href: '/dashboard/request',
    label: 'New Request',
    icon: <FilePlus size={18} />,
    roles: ['DRIVER'],
  },
  {
    href: '/dashboard/my-requests',
    label: 'My Requests',
    icon: <ClipboardList size={18} />,
    roles: ['DRIVER'],
  },
  {
    href: '/dashboard/approvals',
    label: 'Approvals',
    icon: <CheckCircle size={18} />,
    roles: ['ADMIN'],
  },
  {
    href: '/dashboard/users',
    label: 'Manage Users',
    icon: <Users size={18} />,
    roles: ['ADMIN'],
  },
  {
    href: '/dashboard/history',
    label: 'Full History',
    icon: <History size={18} />,
    roles: ['ADMIN'],
  },
  {
    href: '/dashboard/dispense',
    label: 'Dispense Fuel',
    icon: <Fuel size={18} />,
    roles: ['ATTENDANT'],
  },
  {
    href: '/dashboard/log',
    label: 'Dispense Log',
    icon: <ClipboardList size={18} />,
    roles: ['ATTENDANT'],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role ?? 'DRIVER'
  const name = session?.user?.name ?? 'User'
  const email = session?.user?.email ?? ''
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const filtered = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⛽</div>
        <div>
          <div className="sidebar-logo-text">FuelTrack</div>
          <div className="sidebar-logo-sub">Management System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {filtered.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div
            className="user-avatar"
            style={{
              background: roleBg[role] ?? 'rgba(255,255,255,0.1)',
              color: roleColors[role] ?? '#fff',
            }}
          >
            {initials}
          </div>
          <div className="user-info">
            <div className="user-name">{name}</div>
            <div className="user-role">{role.toLowerCase()}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign out"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#f87171')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
