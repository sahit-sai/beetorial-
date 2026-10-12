// ====================================================================
// Beetorial Reusable Dashboard Shell with Role Navigation & Status Badges
// ====================================================================

import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookMarked,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  Sparkles,
  LifeBuoy,
} from 'lucide-react'
import { AppRole } from '../../types'
import { useAuth } from '../../lib/authContext'
import { Logo } from './Logo'

interface NavItem {
  label: string
  path: string
  icon: any
}

const MENU_BY_ROLE: Record<AppRole, NavItem[]> = {
  parent: [
    { label: 'Overview', path: '/parent', icon: LayoutDashboard },
    { label: 'My child', path: '/parent/progress', icon: TrendingUp },
    { label: 'Schedule', path: '/parent/schedule', icon: CalendarDays },
    { label: 'Payments', path: '/parent/payments', icon: CreditCard },
    { label: 'Messages', path: '/parent/messages', icon: MessageCircle },
  ],
  student: [
    { label: 'My learning', path: '/student', icon: LayoutDashboard },
    { label: 'My classes', path: '/student/classes', icon: BookOpen },
    { label: 'Homework', path: '/student/homework', icon: ClipboardList },
    { label: 'Study materials', path: '/student/materials', icon: BookMarked },
  ],
  teacher: [
    { label: 'Overview', path: '/teacher', icon: LayoutDashboard },
    { label: 'My classes', path: '/teacher/classes', icon: BookOpen },
    { label: 'Students', path: '/teacher/students', icon: Users },
    { label: 'Homework', path: '/teacher/homework', icon: ClipboardList },
    { label: 'Attendance', path: '/teacher/attendance', icon: CalendarDays },
    { label: 'Messages', path: '/teacher/messages', icon: MessageCircle },
  ],
  admin: [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Tutors', path: '/admin/tutors', icon: Users },
    { label: 'Courses & classes', path: '/admin/courses', icon: BookOpen },
    { label: 'Enquiries', path: '/admin/enquiries', icon: MessageCircle },
    { label: 'Schedule', path: '/admin/schedule', icon: CalendarDays },
    { label: 'Payments', path: '/admin/payments', icon: Wallet },
    { label: 'Reports', path: '/admin/reports', icon: ChartNoAxesCombined },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ],
  super_admin: [
    { label: 'Overview', path: '/super-admin', icon: LayoutDashboard },
    { label: 'User management', path: '/super-admin/users', icon: Users },
    { label: 'Tutor approvals', path: '/super-admin/tutors', icon: GraduationCap },
    { label: 'Courses', path: '/super-admin/courses', icon: BookOpen },
    { label: 'Organisations', path: '/super-admin/organisations', icon: ShieldCheck },
    { label: 'Subscriptions', path: '/super-admin/subscriptions', icon: CreditCard },
    { label: 'Revenue', path: '/super-admin/revenue', icon: Wallet },
    { label: 'Reports', path: '/super-admin/reports', icon: ChartNoAxesCombined },
    { label: 'Access controls', path: '/super-admin/access-controls', icon: LockKeyhole },
    { label: 'Audit activity', path: '/super-admin/audit', icon: ClipboardList },
    { label: 'Settings', path: '/super-admin/settings', icon: Settings },
  ],
  support: [
    { label: 'Overview', path: '/support', icon: LayoutDashboard },
    { label: 'Enquiries CRM', path: '/support/enquiries', icon: MessageCircle },
    { label: 'Ticket Desk', path: '/support/tickets', icon: LifeBuoy },
    { label: 'Audit Activity', path: '/support/audit', icon: ClipboardList },
  ],
}

const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  parent: 'Parent',
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
  super_admin: 'Super Admin',
  support: 'Support Desk',
}

const ROLE_HOME_PATHS: Record<AppRole, string> = {
  parent: '/parent',
  student: '/student',
  teacher: '/teacher',
  admin: '/admin',
  super_admin: '/super-admin',
  support: '/support',
}

interface AppShellProps {
  children: React.ReactNode
  title: string
  subtitle: string
  activeRole?: AppRole
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  subtitle,
  activeRole,
}) => {
  const { user, role: currentRole, isDemo, signOut, switchDemoRole } = useAuth()
  const role = activeRole || currentRole || 'parent'
  const nav = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  const menuItems = MENU_BY_ROLE[role] || MENU_BY_ROLE.parent
  const userInitial = (user?.full_name || user?.email || role).charAt(0).toUpperCase()
  const roleName = ROLE_DISPLAY_NAMES[role] || role

  const handleSignOut = async () => {
    await signOut()
    nav('/login')
  }

  const handleRoleSwitch = (nextRole: AppRole) => {
    switchDemoRole(nextRole)
    setShowRoleSwitcher(false)
    nav(ROLE_HOME_PATHS[nextRole])
  }

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <Logo />

        <div
          className="workspace"
          onClick={() => isDemo && setShowRoleSwitcher(!showRoleSwitcher)}
          style={{ cursor: isDemo ? 'pointer' : 'default', position: 'relative' }}
          title={isDemo ? 'Click to switch role in demo mode' : 'Workspace'}
        >
          <span className="workspace-icon">
            <GraduationCap size={17} />
          </span>
          <span>
            <b>Beetorial Academy</b>
            <small>{roleName} workspace {isDemo ? '▾' : ''}</small>
          </span>
          <ChevronDown size={14} />

          {showRoleSwitcher && isDemo && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '6px',
                background: '#ffffff',
                border: '1px solid #e9ebf4',
                borderRadius: '11px',
                boxShadow: '0 12px 35px rgba(36, 39, 70, 0.15)',
                zIndex: 30,
                padding: '6px',
                display: 'grid',
                gap: '2px',
              }}
            >
              {(['parent', 'student', 'teacher', 'admin', 'super_admin', 'support'] as AppRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRoleSwitch(r)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    border: 0,
                    borderRadius: '7px',
                    background: r === role ? '#eeecff' : 'transparent',
                    color: r === role ? 'var(--purple)' : 'var(--ink)',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{ROLE_DISPLAY_NAMES[r]}</span>
                  {r === role && <Sparkles size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav">
          {menuItems.map((item) => (
            <NavLink
              end={item.path === ROLE_HOME_PATHS[role]}
              to={item.path}
              key={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `side-link ${isActive ? 'selected' : ''}`}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-box">
            <CircleHelp size={18} />
            <b>Need a hand?</b>
            <small>Support desk available for all learners and guardians.</small>
            <button type="button" onClick={() => nav('/support/tickets')}>
              Get support →
            </button>
          </div>

          <button type="button" className="side-link logout" onClick={handleSignOut}>
            <LogOut size={17} />
            Sign out
          </button>

          <div className="user-mini">
            <div className="user-avatar">{userInitial}</div>
            <div>
              <b>{user?.full_name || user?.email || `${roleName} User`}</b>
              <small>{roleName}</small>
            </div>
            <Settings size={15} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dash-top">
          <button
            type="button"
            className="icon-button mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <Menu />
          </button>

          <div className="crumb">
            Workspace <span>/</span> {roleName}
          </div>

          <div className="dash-actions">
            <label className="dash-search">
              <Search size={15} />
              <input
                placeholder="Search workspace..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="icon-button"
              onClick={() => alert('No unread notifications.')}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="top-avatar">{userInitial}</div>
          </div>
        </header>

        <div className="dash-content">
          <div className="dash-title-row">
            <div>
              <div className="eyebrow">{role.toUpperCase()} WORKSPACE</div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>

            {/* Environmental & Verification Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isDemo ? (
                <span className="demo-badge" title="Running in persistent local verified sandbox">
                  <span /> Verified Sandbox Mode
                </span>
              ) : (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#e4f7e9',
                    border: '1px solid #c8eed1',
                    color: '#257849',
                    fontSize: '9px',
                    fontWeight: 750,
                  }}
                  title="Connected to live Supabase PostgreSQL backend"
                >
                  <ShieldCheck size={14} /> Supabase RLS Active
                </span>
              )}
            </div>
          </div>

          {children}

          <footer className="dash-footer">
            <span>© {new Date().getFullYear()} Beetorial — Learn with confidence.</span>
            <span>Server-enforced RBAC · Least privilege row-level security</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
