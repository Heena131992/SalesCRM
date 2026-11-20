import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Bell,
  Kanban,
  Activity,
  CheckSquare,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';
import './AdminSidebar.css';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  currentUser,
  users = [],
  deals = [],
  onSwitchUser,
  onLogout,
  pendingApprovalsCount = 0,
  searchQuery: externalSearch,
  setSearchQuery: setExternalSearch,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');

  // Agar App.jsx se searchQuery pass ho toh use use karega, warna apna local search chalayega
  const query = externalSearch !== undefined ? externalSearch : internalSearch;
  const handleSearchChange = (val) => {
    if (setExternalSearch) setExternalSearch(val);
    setInternalSearch(val);
  };

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

  // Mobile Top Pill Tabs (Aapke exact tab IDs ke saath)
  const mobilePillTabs = [
    { id: 'overview', label: 'Command' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'team', label: 'Team' },
    { id: 'approvals', label: 'Claims' },
  ];

  // Fully Functional Live Search Results (Staff, Deals, aur Pages ko filter karta hai)
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results = [];

    // 1. Staff / Users Search
    users.forEach((u) => {
      if (
        u.name?.toLowerCase().includes(q) ||
        u.territory?.toLowerCase().includes(q) ||
        u.designation?.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Staff',
          title: u.name,
          subtitle: `${u.designation || 'Sales Rep'} • ${u.territory || 'India'}`,
          targetTab: 'team',
        });
      }
    });

    // 2. Deals / Clients Search
    deals.forEach((d) => {
      const clientName = d.client || d.title || d.company || '';
      if (
        clientName.toLowerCase().includes(q) ||
        d.stage?.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Deal',
          title: clientName,
          subtitle: `${d.stage || 'Pipeline'} • ₹${d.value || 0}`,
          targetTab: 'pipeline',
        });
      }
    });

    // 3. Navigation Pages Search
    menuSections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.label.toLowerCase().includes(q)) {
          results.push({
            type: 'Section',
            title: item.label,
            subtitle: sec.title,
            targetTab: item.id,
          });
        }
      });
    });

    return results.slice(0, 6);
  }, [query, users, deals]);

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
      {/* Mobile Top Header (Unified: Logo + Bell + Hamburger + Pill Tabs + Live Search) */}
      <div className="mobile-admin-bar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        {/* Row 1: Logo + Bell & Hamburger */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
            <span className="admin-sb-logo" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
              SP
            </span>
            SalesPulse Admin
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Bell Icon Button -> Direct Expense Approvals par le jayega */}
            <button
              type="button"
              className="mobile-menu-trigger"
              onClick={() => handleTabClick('approvals')}
              aria-label="Notifications"
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              {pendingApprovalsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '1px 5px',
                    borderRadius: '999px',
                  }}
                >
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {/* Working Hamburger Button */}
            <button
              type="button"
              className="mobile-menu-trigger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Row 2: White Active Pill Navigation Bar */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            background: '#1e293b',
            padding: '5px',
            borderRadius: '12px',
            overflowX: 'auto',
          }}
        >
          {mobilePillTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0f172a' : '#cbd5e1',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Row 3: Fully Functional Live Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: '12px',
              padding: '4px 12px',
              gap: '8px',
            }}
          >
            <Search size={16} color="#64748b" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search staff, deals, or sections..."
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                padding: '6px 0',
                fontSize: '0.9rem',
                color: '#0f172a',
                background: 'transparent',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Live Search Dropdown Results */}
          {query.trim() !== '' && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                background: '#ffffff',
                borderRadius: '14px',
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.22)',
                border: '1px solid #e2e8f0',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleTabClick(item.targetTab);
                      handleSearchChange('');
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      background: '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {item.subtitle}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: '#eff6ff',
                        color: '#2563eb',
                      }}
                    >
                      {item.type}
                    </span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '12px 14px', fontSize: '0.84rem', color: '#64748b' }}>
                  No matching staff or deals found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
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