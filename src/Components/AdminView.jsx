import React, { useState } from 'react';
import { Download, Check, X, UserPlus } from 'lucide-react';
import { formatINR, formatCompactINR } from '../data/mockData';
import { RevenueVsQuotaChart, PipelineFunnelChart, CategoryMixChart } from './Charts';
import { downloadExecutiveReportPDF } from '../utils/pdfGenerator';
import './AdminView.css';

export default function AdminView({
  activeTab,
  users,
  deals,
  activities,
  expenses,
  onApproveExpense,
  onUpdateQuota,
  onAddStaff,
}) {
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    designation: 'Account Executive',
    territory: 'North India (Delhi NCR)',
    quota: 500000,
  });

  const staffList = users.filter((u) => u.role === 'staff');
  const getStaffName = (id) => users.find((u) => u.id === id)?.name || 'Unknown';

  const totalRevenue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((s, d) => s + Number(d.value), 0);

  const activePipeline = deals
    .filter((d) => !['Closed Won', 'Closed Lost'].includes(d.stage))
    .reduce((s, d) => s + Number(d.value), 0);

  const pendingExpenses = expenses.filter((e) => e.status === 'Pending');
  const checkedInCount = staffList.filter((s) => s.status === 'Checked In').length;

  const filteredActivities = activities.filter((act) => {
    const matchesStaff = staffFilter === 'ALL' || act.staffId === staffFilter;
    const matchesText =
      act.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.outcome.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStaff && matchesText;
  });

  const handleExportCSV = () => {
    const headers = ['Staff Name', 'Client', 'Product', 'Stage', 'Value (INR)', 'Close Date'];
    const rows = deals.map((d) => [
      getStaffName(d.staffId),
      d.client,
      d.category,
      d.stage,
      d.value,
      d.closeDate,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'salespulse_team_report.csv';
    a.click();
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name) return;
    onAddStaff({ ...newStaff, quota: Number(newStaff.quota) });
    setNewStaff({
      name: '',
      designation: 'Account Executive',
      territory: 'North India (Delhi NCR)',
      quota: 500000,
    });
    setShowAddStaff(false);
  };

  return (
    <div>
      {/* Executive KPI Summary */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Company Revenue</div>
          <div className="kpi-value">{formatCompactINR(totalRevenue)}</div>
          <div className="kpi-sub">
            {deals.filter((d) => d.stage === 'Closed Won').length} Closed Won Deals
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Open Sales Pipeline</div>
          <div className="kpi-value">{formatCompactINR(activePipeline)}</div>
          <div className="kpi-sub">Across {staffList.length} sales reps</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Field Attendance</div>
          <div className="kpi-value">
            {checkedInCount} / {staffList.length}
          </div>
          <div className="kpi-sub">Staff currently checked in</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Expense Claims</div>
          <div className="kpi-value" style={{ color: 'var(--warning)' }}>
            {pendingExpenses.length}
          </div>
          <div className="kpi-sub">Awaiting executive approval</div>
        </div>
      </div>

      {/* TAB 1: ANALYTICS & LEADERBOARD */}
      {activeTab === 'overview' && (
        <>
          <div className="admin-charts-grid">
            <RevenueVsQuotaChart staffList={staffList} deals={deals} />
            <PipelineFunnelChart deals={deals} />
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Sales Team Leaderboard & Quota Control</h3>
              <div className="admin-toolbar">
                <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
                  <Download size={14} /> Export CSV
                </button>
                <button
  type="button"
  className="btn btn-primary"
  onClick={() => downloadExecutiveReportPDF(users, deals, expenses)}
>
  Download Executive PDF
</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddStaff(true)}>
                  <UserPlus size={14} /> Add Staff
                </button>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Live Attendance</th>
                    <th>Closed Revenue</th>
                    <th>Monthly Quota</th>
                    <th>Attainment</th>
                    <th>Adjust Quota</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => {
                    const won = deals
                      .filter((d) => d.staffId === staff.id && d.stage === 'Closed Won')
                      .reduce((s, d) => s + Number(d.value), 0);
                    const pct = staff.quota > 0 ? Math.round((won / staff.quota) * 100) : 0;

                    return (
                      <tr key={staff.id}>
                        <td>
                          <strong>{staff.name}</strong>
                          <div className="staff-sub-territory">{staff.territory}</div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              staff.status === 'Checked In' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            {staff.status} • {staff.workMode}
                          </span>
                        </td>
                        <td>
                          <strong>{formatINR(won)}</strong>
                        </td>
                        <td>{formatINR(staff.quota)}</td>
                        <td>
                          <strong>{pct}%</strong>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onUpdateQuota(staff.id, staff.quota + 50000)}
                          >
                            +₹50K Quota
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <CategoryMixChart deals={deals} />
        </>
      )}

      {/* TAB 2: DAILY STAFF FEED */}
      {activeTab === 'feed' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Live Daily Staff Selling Feed</h3>
            <div className="admin-toolbar">
              <input
                type="text"
                placeholder="Search client or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
                <option value="ALL">All Staff Members</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Staff</th>
                  <th>Client</th>
                  <th>Activity</th>
                  <th>Calls</th>
                  <th>Daily Progress Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => (
                  <tr key={act.id}>
                    <td>{act.date}</td>
                    <td>
                      <strong>{getStaffName(act.staffId)}</strong>
                    </td>
                    <td>{act.client}</td>
                    <td>{act.type}</td>
                    <td>{act.callsCount}</td>
                    <td>{act.outcome}</td>
                    <td>
                      <span
                        className={`badge ${
                          act.status === 'Overdue Follow-up' ? 'badge-danger' : 'badge-primary'
                        }`}
                      >
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSE APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Field Travel & Hospitality Expense Approvals</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Staff</th>
                  <th>Client</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td>
                      <strong>{getStaffName(exp.staffId)}</strong>
                    </td>
                    <td>{exp.client}</td>
                    <td>{exp.category}</td>
                    <td>
                      <strong>{formatINR(exp.amount)}</strong>
                    </td>
                    <td>{exp.notes}</td>
                    <td>
                      {exp.status === 'Pending' ? (
                        <div className="approval-btn-group">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => onApproveExpense(exp.id, 'Approved')}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-danger-soft btn-sm"
                            onClick={() => onApproveExpense(exp.id, 'Rejected')}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`badge ${
                            exp.status === 'Approved' ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {exp.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {showAddStaff && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="card-header">
              <h3 className="card-title">Onboard New Sales Representative</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddStaff(false)}>
                Close
              </button>
            </div>
            <form onSubmit={handleCreateStaff}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Territory</label>
                <input
                  type="text"
                  value={newStaff.territory}
                  onChange={(e) => setNewStaff({ ...newStaff, territory: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label>Monthly Sales Quota (₹)</label>
                <input
                  type="number"
                  value={newStaff.quota}
                  onChange={(e) => setNewStaff({ ...newStaff, quota: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Add Team Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}