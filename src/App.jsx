import React, { useState, useEffect } from 'react';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import './App.css';

import { STAGES, INITIAL_STATE } from './data/mockData';
import RoleGateway from './Components/RoleGateway';
import AdminSidebar from './Components/AdminSidebar';
import StaffSidebar from './Components/StaffSidebar';
import AdminView from './Components/AdminView';
import AdminStaffManagement from './Components/AdminStaffManagement';
import AdminMasterPipeline from './Components/AdminMasterPipeline';
import AdminReports from './Components/AdminReports';
import StaffView from './Components/StaffView';


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [data, setData] = useState({
    users: [],
    deals: [],
    activities: [],
    expenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState('');
 

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Load Full Data from MongoDB Backend (with fallback to INITIAL_STATE if backend is offline)
  const fetchAllData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/state`);
      if (!res.ok) throw new Error('Server error');
      const json = await res.json();
      if (json && Array.isArray(json.users) && json.users.length > 0) {
        setData(json);
      } else {
        setData(INITIAL_STATE);
      }
    } catch (err) {
      console.warn('Backend offline, loading fallback demo state:', err);
      setData(INITIAL_STATE);
      triggerToast('Running in offline demo mode (start backend on port 5000 for MongoDB)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const currentUser = data.users.find((u) => u.id === currentUserId);

  const handleSelectUser = (userId) => {
    setCurrentUserId(userId);
    setActiveTab('overview');
  };

  // 1. Shift Check-In / Check-Out
  const handleToggleCheckIn = async (userId, workMode) => {
    const user = data.users.find((u) => u.id === userId);
    if (!user) return;
    const checkingIn = user.status !== 'Checked In';

    const payload = {
      status: checkingIn ? 'Checked In' : 'Offline',
      workMode: checkingIn ? workMode : 'Offline',
      checkInTime: checkingIn ? Date.now() : null,
    };

    try {
      const res = await fetch(`${API_BASE}/users/${userId}/checkin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updatedUser = await res.json();
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? updatedUser : u)),
      }));
    } catch {
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, ...payload } : u)),
      }));
    }
    triggerToast(checkingIn ? `Checked in (${workMode})` : 'Shift ended');
  };

  // 2. Add New Deal
  const handleAddDeal = async (newDeal) => {
    try {
      const res = await fetch(`${API_BASE}/api/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal),
      });
      const savedDeal = await res.json();
      setData((prev) => ({ ...prev, deals: [savedDeal, ...prev.deals] }));
      triggerToast('Deal saved to MongoDB!');
    } catch {
      const localDeal = { ...newDeal, id: 'd-' + Date.now() };
      setData((prev) => ({ ...prev, deals: [localDeal, ...prev.deals] }));
      triggerToast('Deal added!');
    }
  };

  // 3. Update Deal Stage
  const handleUpdateDealStage = async (dealId, newStage) => {
    try {
      const res = await fetch(`${API_BASE}/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      const updatedDeal = await res.json();
      setData((prev) => ({
        ...prev,
        deals: prev.deals.map((d) => (d.id === dealId ? updatedDeal : d)),
      }));
    } catch {
      setData((prev) => ({
        ...prev,
        deals: prev.deals.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)),
      }));
    }
    triggerToast(`Deal moved to ${newStage}`);
  };

  const handleAdvanceDeal = (dealId) => {
    const deal = data.deals.find((d) => d.id === dealId);
    if (!deal) return;
    const idx = STAGES.indexOf(deal.stage);
    const nextStage = STAGES[Math.min(idx + 1, STAGES.length - 2)];
    handleUpdateDealStage(dealId, nextStage);
  };

  // 4. Reassign Deal Owner
  const handleReassignDeal = async (dealId, newStaffId) => {
    try {
      const res = await fetch(`${API_BASE}/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: newStaffId }),
      });
      const updatedDeal = await res.json();
      setData((prev) => ({
        ...prev,
        deals: prev.deals.map((d) => (d.id === dealId ? updatedDeal : d)),
      }));
    } catch {
      setData((prev) => ({
        ...prev,
        deals: prev.deals.map((d) => (d.id === dealId ? { ...d, staffId: newStaffId } : d)),
      }));
    }
    triggerToast('Deal reassigned!');
  };

  // 5. Delete Deal
  const handleDeleteDeal = async (dealId) => {
    try {
      await fetch(`${API_BASE}/deals/${dealId}`, { method: 'DELETE' });
    } catch {
      // ignore if offline
    }
    setData((prev) => ({
      ...prev,
      deals: prev.deals.filter((d) => d.id !== dealId),
    }));
    triggerToast('Deal deleted');
  };

  // 6. Log Daily Activity
  const handleAddActivity = async (newAct) => {
    try {
      const res = await fetch(`${API_BASE}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct),
      });
      const savedAct = await res.json();
      setData((prev) => ({ ...prev, activities: [savedAct, ...prev.activities] }));
      triggerToast('Daily progress saved to MongoDB!');
    } catch {
      const localAct = { ...newAct, id: 'act-' + Date.now() };
      setData((prev) => ({ ...prev, activities: [localAct, ...prev.activities] }));
      triggerToast('Daily progress logged!');
    }
  };

  // 7. Submit & Approve Expenses
  const handleAddExpense = async (newExp) => {
    try {
      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExp),
      });
      const savedExp = await res.json();
      setData((prev) => ({ ...prev, expenses: [savedExp, ...prev.expenses] }));
      triggerToast('Expense claim submitted to MongoDB!');
    } catch {
      const localExp = { ...newExp, id: 'exp-' + Date.now() };
      setData((prev) => ({ ...prev, expenses: [localExp, ...prev.expenses] }));
      triggerToast('Expense claim submitted!');
    }
  };

  const handleApproveExpense = async (expId, decision) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/${expId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision }),
      });
      const updatedExp = await res.json();
      setData((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === expId ? updatedExp : e)),
      }));
    } catch {
      setData((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === expId ? { ...e, status: decision } : e)),
      }));
    }
    triggerToast(`Expense marked as ${decision}`);
  };

  // 8. Onboard Staff & Update Quota
  const handleUpdateQuota = async (staffId, newQuota) => {
    try {
      const res = await fetch(`${API_BASE}/users/${staffId}/quota`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quota: newQuota }),
      });
      const updatedUser = await res.json();
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === staffId ? updatedUser : u)),
      }));
    } catch {
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === staffId ? { ...u, quota: newQuota } : u)),
      }));
    }
    triggerToast('Sales quota updated!');
  };

  const handleAddStaff = async (staffPayload) => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...staffPayload, role: 'staff' }),
      });
      const savedUser = await res.json();
      setData((prev) => ({ ...prev, users: [...prev.users, savedUser] }));
      triggerToast(`${savedUser.name} onboarded to MongoDB!`);
    } catch {
      const localUser = {
        ...staffPayload,
        id: 'staff-' + Date.now(),
        role: 'staff',
        status: 'Offline',
        workMode: 'Offline',
        checkInTime: null,
      };
      setData((prev) => ({ ...prev, users: [...prev.users, localUser] }));
      triggerToast(`${localUser.name} added to team!`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Loading SalesPulse Workspace...</h2>
      </div>
    );
  }

  if (!currentUser) {
    return <RoleGateway users={data.users} onSelectUser={handleSelectUser} />;
  }

  const pendingApprovalsCount = data.expenses.filter((e) => e.status === 'Pending').length;

  const getPageTitle = () => {
    if (currentUser.role === 'admin') {
      const adminTitles = {
        overview: 'Executive Sales Command Center',
        team: 'Sales Team & Quota Management',
        pipeline: 'Master Company Deal Pipeline',
        feed: 'Live Daily Staff Selling Feed',
        approvals: 'Field Expense Approvals',
        reports: 'Revenue & Commission Audit Reports',
      };
      return adminTitles[activeTab] || 'Admin Dashboard';
      
    }
    return `Welcome, ${currentUser.name}`;
  };
  
  return (
    <div className={`app-shell ${darkMode ? 'dark-theme' : ''}`}>
      {currentUser.role === 'admin' ? (
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          users={data.users}
          onSwitchUser={handleSelectUser}
          onLogout={() => setCurrentUserId(null)}
          pendingApprovalsCount={pendingApprovalsCount}
        />
      ) : (
        <StaffSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          users={data.users}
          deals={data.deals}
          activities={data.activities}
          onSwitchUser={handleSelectUser}
          onLogout={() => setCurrentUserId(null)}
        />
      )}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{getPageTitle()}</h1>
            <p>
              {currentUser.designation} • {currentUser.territory}
            </p>
          </div>

          <div className="topbar-actions">
            <button className="btn btn-outline btn-sm" onClick={fetchAllData}>
              <RefreshCw size={15} /> Sync DB
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </header>

        <main className="workspace-body">
          {currentUser.role === 'admin' && (
            <>
              {(activeTab === 'overview' || activeTab === 'feed' || activeTab === 'approvals') && (
                <AdminView
                  activeTab={activeTab}
                  users={data.users}
                  deals={data.deals}
                  activities={data.activities}
                  expenses={data.expenses}
                  onApproveExpense={handleApproveExpense}
                  onUpdateQuota={handleUpdateQuota}
                  onAddStaff={handleAddStaff}
                />
              )}

              {activeTab === 'team' && (
                <AdminStaffManagement
                  users={data.users}
                  deals={data.deals}
                  activities={data.activities}
                  onAddStaff={handleAddStaff}
                  onUpdateQuota={handleUpdateQuota}
                />
              )}

              {activeTab === 'pipeline' && (
                <AdminMasterPipeline
                  users={data.users}
                  deals={data.deals}
                  onAddDeal={handleAddDeal}
                  onUpdateDealStage={handleUpdateDealStage}
                  onReassignDeal={handleReassignDeal}
                  onDeleteDeal={handleDeleteDeal}
                />
              )}

              {activeTab === 'reports' && (
                <AdminReports
                  users={data.users}
                  deals={data.deals}
                  expenses={data.expenses}
                />
              )}
            </>
          )}

          {currentUser.role === 'staff' && (
            <StaffView
              activeTab={
                activeTab === 'followups'
                  ? 'overview'
                  : activeTab === 'commission'
                  ? 'expenses'
                  : activeTab
              }
              currentUser={currentUser}
              deals={data.deals}
              activities={data.activities}
              expenses={data.expenses}
              onToggleCheckIn={handleToggleCheckIn}
              onAddDeal={handleAddDeal}
              onAdvanceDeal={handleAdvanceDeal}
              onAddActivity={handleAddActivity}
              onAddExpense={handleAddExpense}
            />
          )}
        </main>
      </div>

      {toast && <div className="toast-banner">{toast}</div>}
    </div>
  );
}