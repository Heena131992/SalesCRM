import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Activity,
  CheckSquare,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import './AdminSidebar.css';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  onSwitchUser,
  onLogout,
  pendingApprovalsCount = 0,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuSections = [
    {
      title: 'Analytics & Monitoring',
      items: [
        { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
        { id: 'team', label: 'Staff Management', icon: Users },
        { id: 'pipeline', label: 'Master Deal Pipeline', icon: Kanban },
      ],
    },
    {
      title: 'Operations & Audit',
      items: [
        { id: 'feed', label: 'Daily Progress Feed', icon: Activity },
        {
          id: 'approvals',
          label: 'Expense Approvals',
          icon: CheckSquare,
          badge: pendingApprovalsCount,
        },
        { id: 'reports', label: 'Revenue Reports', icon: FileBarChart2 },
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
    : 'AD';

  return (
    <>
      {/* Mobile Top Header */}
      <div className="mobile-admin-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
          <span className="admin-sb-logo" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
            SP
          </span>
          SalesPulse Admin
        </div>
        <button className="mobile-menu-trigger" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Admin Sidebar */}
      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand & Collapse Button */}
        <div className="admin-sb-header">
          <div className="admin-sb-brand">
            <div className="admin-sb-logo">SP</div>
            {!collapsed && (
              <div>
                <div className="admin-sb-title">SalesPulse</div>
                <div className="admin-sb-role-tag">Admin Portal</div>
              </div>
            )}
          </div>

          <button
            className="admin-sb-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="admin-sb-nav">
          {menuSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <div className="admin-sb-section-label">{section.title}</div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`admin-sb-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleTabClick(item.id)}
                    title={collapsed ? item.label : ''}
                  >
                    <span className="admin-sb-link-left">
                      <Icon size={18} />
                      {!collapsed && <span>{item.label}</span>}
                    </span>
                    {!collapsed && item.badge > 0 && (
                      <span className="admin-sb-badge">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Admin Profile & Role Switcher */}
        <div className="admin-sb-footer">
          {!collapsed && (
            <>
              <div className="admin-profile-card">
                <div className="admin-avatar">{initials}</div>
                <div className="admin-profile-info">
                  <div className="admin-profile-name">{currentUser?.name}</div>
                  <div className="admin-profile-sub">{currentUser?.designation}</div>
                </div>
              </div>

              <select
                className="admin-switcher-select"
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

          <button className="admin-logout-btn" onClick={onLogout} title="Exit to Role Selection">
            <LogOut size={16} />
            {!collapsed && <span>Switch Role / Exit</span>}
          </button>
        </div>
      </aside>
    </>
  );
}