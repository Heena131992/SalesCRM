import React, { useState } from 'react';
import {
  LayoutDashboard,
  Kanban,
  Receipt,
  CalendarClock,
  Award,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { formatCompactINR } from '../data/mockData';
import './StaffSidebar.css';

export default function StaffSidebar({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  deals = [],
  activities = [],
  onSwitchUser,
  onLogout,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Calculate Staff Personal Quota Progress
  const myWonRevenue = deals
    .filter((d) => d.staffId === currentUser?.id && d.stage === 'Closed Won')
    .reduce((sum, d) => sum + Number(d.value), 0);

  const quotaPct =
    currentUser?.quota > 0
      ? Math.min(100, Math.round((myWonRevenue / currentUser.quota) * 100))
      : 0;

  // Count Pending / Overdue Follow-ups for Badge
  const dueFollowUpsCount = activities.filter(
    (a) =>
      a.staffId === currentUser?.id &&
      (a.status === 'Follow-up Due' || a.status === 'Overdue Follow-up')
  ).length;

  const menuSections = [
    {
      title: 'Daily Workspace',
      items: [
        { id: 'overview', label: 'My Daily Work', icon: LayoutDashboard },
        { id: 'pipeline', label: 'My Kanban Pipeline', icon: Kanban },
        {
          id: 'followups',
          label: 'Follow-Up Tasks',
          icon: CalendarClock,
          badge: dueFollowUpsCount,
        },
      ],
    },
    {
      title: 'Earnings & Claims',
      items: [
        { id: 'expenses', label: 'Expense Claims', icon: Receipt },
        { id: 'commission', label: 'Commission & Payouts', icon: Award },
      ],
    },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ST';

  const isCheckedIn = currentUser?.status === 'Checked In';

  return (
    <>
      {/* Mobile Top Header */}
      <div className="mobile-staff-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
          <span className="staff-sb-logo" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
            SP
          </span>
          SalesPulse Staff
        </div>
        <button className="mobile-staff-trigger" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="staff-sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Staff Sidebar */}
      <aside
        className={`staff-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand & Collapse Toggle */}
        <div className="staff-sb-header">
          <div className="staff-sb-brand">
            <div className="staff-sb-logo">SP</div>
            {!collapsed && (
              <div>
                <div className="staff-sb-title">SalesPulse</div>
                <div className="staff-sb-role-tag">Sales Rep Portal</div>
              </div>
            )}
          </div>

          <button
            className="staff-sb-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Live Monthly Target Progress Mini-Card */}
        {!collapsed && (
          <div className="staff-quota-widget">
            <div className="staff-quota-top">
              <span>Monthly Target</span>
              <span>{quotaPct}%</span>
            </div>
            <div className="staff-quota-bar-bg">
              <div className="staff-quota-bar-fill" style={{ width: `${quotaPct}%` }} />
            </div>
            <div className="staff-quota-sub">
              {formatCompactINR(myWonRevenue)} of {formatCompactINR(currentUser?.quota)}
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="staff-sb-nav">
          {menuSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <div className="staff-sb-section-label">{section.title}</div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`staff-sb-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleTabClick(item.id)}
                    title={collapsed ? item.label : ''}
                  >
                    <span className="staff-sb-link-left">
                      <Icon size={18} />
                      {!collapsed && <span>{item.label}</span>}
                    </span>
                    {!collapsed && item.badge > 0 && (
                      <span className="staff-sb-badge">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Staff Profile & Switcher */}
        <div className="staff-sb-footer">
          {!collapsed && (
            <>
              <div className="staff-profile-card">
                <div className="staff-avatar-wrap">
                  <div className="staff-avatar">{initials}</div>
                  <span className={`status-dot ${isCheckedIn ? 'online' : ''}`} />
                </div>
                <div className="staff-profile-info">
                  <div className="staff-profile-name">{currentUser?.name}</div>
                  <div className="staff-profile-sub">
                    {isCheckedIn ? `Active • ${currentUser?.workMode}` : 'Shift Offline'}
                  </div>
                </div>
              </div>

              <select
                className="staff-switcher-select"
                value={currentUser?.id}
                onChange={(e) => onSwitchUser(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    Switch: {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </>
          )}

          <button className="staff-logout-btn" onClick={onLogout} title="Exit to Role Selection">
            <LogOut size={16} />
            {!collapsed && <span>Switch Role / Exit</span>}
          </button>
        </div>
      </aside>
    </>
  );
}