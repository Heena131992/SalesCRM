import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  SlidersHorizontal,
  Award,
  MapPin,
  Briefcase,
  Trash2,
  Eye,
} from 'lucide-react';
import { formatINR, formatCompactINR } from '../data/mockData';
import './AdminStaffManagement.css';

export default function AdminStaffManagement({
  users,
  deals,
  activities,
  onAddStaff,
  onUpdateQuota,
  onRemoveStaff,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [quotaModalStaff, setQuotaModalStaff] = useState(null);
  const [customQuotaInput, setCustomQuotaInput] = useState('');
  const [inspectStaff, setInspectStaff] = useState(null);

  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    designation: 'Account Executive',
    territory: 'North India (Delhi NCR)',
    quota: 500000,
  });

  const staffMembers = users.filter((u) => u.role === 'staff');

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(search.toLowerCase()) ||
      staff.territory.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStaffStats = (staff) => {
    const staffDeals = deals.filter((d) => d.staffId === staff.id);
    const wonRevenue = staffDeals
      .filter((d) => d.stage === 'Closed Won')
      .reduce((s, d) => s + Number(d.value), 0);
    const openPipeline = staffDeals
      .filter((d) => !['Closed Won', 'Closed Lost'].includes(d.stage))
      .reduce((s, d) => s + Number(d.value), 0);
    const staffLogs = activities.filter((a) => a.staffId === staff.id).length;
    const attainmentPct = staff.quota > 0 ? Math.round((wonRevenue / staff.quota) * 100) : 0;

    // Tiered Commission: 4% base + 6% accelerator above 100% quota
    const baseEarned = Math.min(wonRevenue, staff.quota) * 0.04;
    const bonusEarned = Math.max(0, wonRevenue - staff.quota) * 0.06;
    const commission = Math.round(baseEarned + bonusEarned);

    return { wonRevenue, openPipeline, staffLogs, attainmentPct, commission, staffDeals };
  };

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    if (!newStaffForm.name.trim()) return;
    onAddStaff({
      ...newStaffForm,
      quota: Number(newStaffForm.quota) || 500000,
    });
    setNewStaffForm({
      name: '',
      designation: 'Account Executive',
      territory: 'North India (Delhi NCR)',
      quota: 500000,
    });
    setShowOnboardModal(false);
  };

  const openQuotaEditor = (staff) => {
    setQuotaModalStaff(staff);
    setCustomQuotaInput(String(staff.quota));
  };

  const handleQuotaSave = (e) => {
    e.preventDefault();
    if (!quotaModalStaff) return;
    onUpdateQuota(quotaModalStaff.id, Number(customQuotaInput) || 0);
    setQuotaModalStaff(null);
  };

  return (
    <div>
      {/* Top Toolbar */}
      <div className="card staff-mgmt-toolbar">
        <div className="staff-filter-group">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search name or territory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Attendance Status ({staffMembers.length})</option>
            <option value="Checked In">Checked In (Active)</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setShowOnboardModal(true)}>
          <UserPlus size={16} /> Onboard New Staff
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="staff-cards-grid">
        {filteredStaff.map((staff) => {
          const stats = getStaffStats(staff);
          const initials = staff.name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div key={staff.id} className="staff-profile-card">
              <div>
                <div className="staff-card-top">
                  <div className="staff-identity">
                    <div className="staff-initials-badge">{initials}</div>
                    <div>
                      <div className="staff-name-title">{staff.name}</div>
                      <div className="staff-meta-sub">
                        <Briefcase size={12} style={{ verticalAlign: 'middle' }} />{' '}
                        {staff.designation}
                      </div>
                      <div className="staff-meta-sub">
                        <MapPin size={12} style={{ verticalAlign: 'middle' }} />{' '}
                        {staff.territory}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      staff.status === 'Checked In' ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {staff.status === 'Checked In' ? staff.workMode : 'Offline'}
                  </span>
                </div>

                {/* Metrics Strip */}
                <div className="staff-metrics-strip" style={{ marginTop: '1rem' }}>
                  <div className="staff-metric-item">
                    <span>Closed Won</span>
                    <strong>{formatCompactINR(stats.wonRevenue)}</strong>
                  </div>
                  <div className="staff-metric-item">
                    <span>Pipeline</span>
                    <strong>{formatCompactINR(stats.openPipeline)}</strong>
                  </div>
                  <div className="staff-metric-item">
                    <span>Commission</span>
                    <strong style={{ color: 'var(--success)' }}>
                      {formatCompactINR(stats.commission)}
                    </strong>
                  </div>
                </div>

                {/* Quota Progress Bar */}
                <div className="staff-quota-bar-wrap" style={{ marginTop: '0.9rem' }}>
                  <div className="staff-quota-labels">
                    <span>Quota Attainment</span>
                    <strong>
                      {stats.attainmentPct}% of {formatCompactINR(staff.quota)}
                    </strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(100, stats.attainmentPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="staff-card-actions">
                <button
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => openQuotaEditor(staff)}
                >
                  <SlidersHorizontal size={14} /> Set Quota
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setInspectStaff(staff)}
                >
                  <Eye size={14} /> Inspect ({stats.staffDeals.length})
                </button>
                {onRemoveStaff && (
                  <button
                    className="btn btn-danger-soft btn-sm"
                    onClick={() => onRemoveStaff(staff.id)}
                    title="Remove Staff Member"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ONBOARD STAFF MODAL */}
      {showOnboardModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="card-header">
              <h3 className="card-title">Onboard Sales Representative</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowOnboardModal(false)}>
                Close
              </button>
            </div>
            <form onSubmit={handleOnboardSubmit}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Siddharth Malhotra"
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Designation</label>
                <input
                  type="text"
                  value={newStaffForm.designation}
                  onChange={(e) =>
                    setNewStaffForm({ ...newStaffForm, designation: e.target.value })
                  }
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Assigned Territory</label>
                <input
                  type="text"
                  value={newStaffForm.territory}
                  onChange={(e) =>
                    setNewStaffForm({ ...newStaffForm, territory: e.target.value })
                  }
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Monthly Sales Quota (INR)</label>
                <input
                  type="number"
                  min="50000"
                  step="10000"
                  value={newStaffForm.quota}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, quota: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Create Staff Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM QUOTA MODAL */}
      {quotaModalStaff && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="card-header">
              <h3 className="card-title">Set Monthly Quota: {quotaModalStaff.name}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setQuotaModalStaff(null)}>
                Close
              </button>
            </div>
            <form onSubmit={handleQuotaSave}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>New Monthly Target (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="25000"
                  value={customQuotaInput}
                  onChange={(e) => setCustomQuotaInput(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Save Quota Target
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT STAFF DEALS MODAL */}
      {inspectStaff && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '640px' }}>
            <div className="card-header">
              <h3 className="card-title">{inspectStaff.name} — Assigned Deals</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setInspectStaff(null)}>
                Close
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Product</th>
                    <th>Stage</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {deals
                    .filter((d) => d.staffId === inspectStaff.id)
                    .map((d) => (
                      <tr key={d.id}>
                        <td><strong>{d.client}</strong></td>
                        <td>{d.category}</td>
                        <td><span className="badge badge-primary">{d.stage}</span></td>
                        <td>{formatINR(d.value)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}