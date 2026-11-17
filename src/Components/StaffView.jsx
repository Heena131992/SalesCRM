import React, { useState, useEffect } from 'react';
import { Play, Square, Plus, PhoneCall, IndianRupee, ArrowRight, Award } from 'lucide-react';
import { STAGES, CATEGORIES, formatINR, formatCompactINR, getTodayDate } from '../data/mockData';
import { downloadCommissionSlipPDF, downloadDealQuotePDF } from '../utils/pdfGenerator';
import './StaffView.css';

export default function StaffView({
  activeTab,
  currentUser,
  deals,
  activities,
  expenses,
  onToggleCheckIn,
  onAddDeal,
  onAdvanceDeal,
  onAddActivity,
  onAddExpense,
}) {
  const [elapsed, setElapsed] = useState('00:00:00');
  const [workMode, setWorkMode] = useState('Client Field Visit');
  const [showDealModal, setShowDealModal] = useState(false);

  const [dealForm, setDealForm] = useState({
    client: '',
    contactPerson: '',
    category: CATEGORIES[0],
    value: '',
    stage: 'New Lead',
  });

  const [actForm, setActForm] = useState({
    type: 'Client Meeting',
    client: '',
    callsCount: 5,
    followUpDate: getTodayDate(),
    outcome: '',
  });

  const [expForm, setExpForm] = useState({
    category: 'Fuel & Local Travel',
    client: '',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    if (!currentUser?.checkInTime) {
      setElapsed('00:00:00');
      return;
    }
    const updateClock = () => {
      const diff = Math.max(0, Math.floor((Date.now() - currentUser.checkInTime) / 1000));
      const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const secs = String(diff % 60).padStart(2, '0');
      setElapsed(`${hrs}:${mins}:${secs}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [currentUser?.checkInTime]);

  const myDeals = deals.filter((d) => d.staffId === currentUser.id);
  const myActivities = activities.filter((a) => a.staffId === currentUser.id);
  const myExpenses = expenses.filter((e) => e.staffId === currentUser.id);

  const wonRevenue = myDeals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + Number(d.value), 0);

  const openPipeline = myDeals
    .filter((d) => !['Closed Won', 'Closed Lost'].includes(d.stage))
    .reduce((sum, d) => sum + Number(d.value), 0);

  const quotaPct = currentUser.quota > 0 ? Math.round((wonRevenue / currentUser.quota) * 100) : 0;

  const baseEligible = Math.min(wonRevenue, currentUser.quota);
  const bonusEligible = Math.max(0, wonRevenue - currentUser.quota);
  const totalCommission = Math.round(baseEligible * 0.04 + bonusEligible * 0.06);

  const handleDealSubmit = (e) => {
    e.preventDefault();
    if (!dealForm.client || !dealForm.value) return;
    onAddDeal({
      ...dealForm,
      staffId: currentUser.id,
      value: Number(dealForm.value),
      closeDate: getTodayDate(),
    });
    setDealForm({ client: '', contactPerson: '', category: CATEGORIES[0], value: '', stage: 'New Lead' });
    setShowDealModal(false);
  };

  const handleActivitySubmit = (e) => {
    e.preventDefault();
    if (!actForm.client || !actForm.outcome) return;
    onAddActivity({
      ...actForm,
      staffId: currentUser.id,
      date: getTodayDate(),
      status: 'On Track',
    });
    setActForm({ type: 'Client Meeting', client: '', callsCount: 5, followUpDate: getTodayDate(), outcome: '' });
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expForm.client || !expForm.amount) return;
    onAddExpense({
      ...expForm,
      staffId: currentUser.id,
      date: getTodayDate(),
      amount: Number(expForm.amount),
      status: 'Pending',
    });
    setExpForm({ category: 'Fuel & Local Travel', client: '', amount: '', notes: '' });
  };

  return (
    <div>
      {/* Shift Check-In Banner */}
      <div className="card shift-banner">
        <div>
          <span className="badge badge-primary">{currentUser.territory}</span>
          <h2 className="shift-title">
            Shift Status: {currentUser.status} ({currentUser.workMode})
          </h2>
          <p className="shift-sub">
            Active Shift Timer: <strong>{elapsed}</strong>
          </p>
        </div>

        <div className="shift-controls">
          {currentUser.status !== 'Checked In' && (
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
              <option value="Client Field Visit">Client Field Visit</option>
              <option value="Office">Office</option>
              <option value="Remote">Remote</option>
            </select>
          )}
          <button
            className={`btn ${currentUser.status === 'Checked In' ? 'btn-danger-soft' : 'btn-success'}`}
            onClick={() => onToggleCheckIn(currentUser.id, workMode)}
          >
            {currentUser.status === 'Checked In' ? (
              <><Square size={15} /> End Shift</>
            ) : (
              <><Play size={15} /> Start Shift</>
            )}
          </button>
          <button className="btn btn-primary" onClick={() => setShowDealModal(true)}>
            <Plus size={16} /> New Deal
          </button>
        </div>
         <button
  type="button"
  className="btn btn-primary"
  onClick={() => downloadCommissionSlipPDF(currentUser, deals)}
>
  Download Commission PDF
</button>
      </div>

      {/* Staff KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Closed Revenue</div>
          <div className="kpi-value">{formatCompactINR(wonRevenue)}</div>
          <div className="kpi-sub">
            {quotaPct}% of {formatCompactINR(currentUser.quota)} Quota
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Pipeline</div>
          <div className="kpi-value">{formatCompactINR(openPipeline)}</div>
          <div className="kpi-sub">{myDeals.length} assigned deals</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Estimated Commission</div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>
            {formatINR(totalCommission)}
          </div>
          <div className="kpi-sub">4% Base + 6% Accelerator</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Daily Work Logs</div>
          <div className="kpi-value">{myActivities.length}</div>
          <div className="kpi-sub">
            {myActivities.reduce((s, a) => s + Number(a.callsCount || 0), 0)} total calls
          </div>
        </div>
        
      </div>

      {/* TAB 1: DAILY SELLING WORK */}
      {activeTab === 'overview' && (
        <>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Log Daily Selling Work & Client Progress</h3>
            </div>
            <form onSubmit={handleActivitySubmit}>
              <div className="form-grid" style={{ marginBottom: '0.85rem' }}>
                <div className="form-group">
                  <label>Activity Type</label>
                  <select value={actForm.type} onChange={(e) => setActForm({ ...actForm, type: e.target.value })}>
                    <option>Client Meeting</option>
                    <option>Product Demo</option>
                    <option>Negotiation Call</option>
                    <option>Cold Outreach</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Client / Prospect Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Reliance Retail"
                    value={actForm.client}
                    onChange={(e) => setActForm({ ...actForm, client: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Calls Made Today</label>
                  <input
                    type="number"
                    min="0"
                    value={actForm.callsCount}
                    onChange={(e) => setActForm({ ...actForm, callsCount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={actForm.followUpDate}
                    onChange={(e) => setActForm({ ...actForm, followUpDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label>Progress Summary & Key Takeaways *</label>
                <input
                  type="text"
                  placeholder="Describe client feedback, blockers, or next steps..."
                  value={actForm.outcome}
                  onChange={(e) => setActForm({ ...actForm, outcome: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <PhoneCall size={15} /> Submit Daily Progress Update
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Recent Work Logs</h3>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Calls</th>
                    <th>Progress Notes</th>
                    <th>Follow-Up</th>
                  </tr>
                </thead>
                <tbody>
                  {myActivities.map((act) => (
                    <tr key={act.id}>
                      <td>{act.date}</td>
                      <td><strong>{act.client}</strong></td>
                      <td>{act.type}</td>
                      <td>{act.callsCount}</td>
                      <td>{act.outcome}</td>
                      <td><span className="badge badge-warning">{act.followUpDate}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: KANBAN PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My 6-Stage Kanban Deal Pipeline</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDealModal(true)}>
              <Plus size={14} /> Add Deal
            </button>
          </div>
          <div className="kanban-board">
            {STAGES.map((stage) => {
              const stageDeals = myDeals.filter((d) => d.stage === stage);
              return (
                <div key={stage} className="kanban-col">
                  <div className="kanban-col-header">
                    <span>{stage}</span>
                    <span className="badge badge-primary">{stageDeals.length}</span>
                  </div>
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="deal-card">
                      <h4>{deal.client}</h4>
                      <div className="deal-category-label">{deal.category}</div>
                      <div className="deal-amount">{formatINR(deal.value)}</div>
                      {stage !== 'Closed Won' && stage !== 'Closed Lost' && (
                        <button
                          className="btn btn-outline btn-sm advance-stage-btn"
                          onClick={() => onAdvanceDeal(deal.id)}
                        >
                          Advance Stage <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES & COMMISSION */}
      {activeTab === 'expenses' && (
        <div className="staff-split-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Submit Field Expense Claim</h3>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Expense Category</label>
                <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
                  <option>Fuel & Local Travel</option>
                  <option>Client Lunch / Hospitality</option>
                  <option>Outstation Flight / Cab</option>
                  <option>Event / Demo Materials</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Client Visited *</label>
                <input
                  type="text"
                  value={expForm.client}
                  onChange={(e) => setExpForm({ ...expForm, client: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Amount (INR) *</label>
                <input
                  type="number"
                  min="1"
                  value={expForm.amount}
                  onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label>Receipt Notes</label>
                <input
                  type="text"
                  value={expForm.notes}
                  onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <IndianRupee size={15} /> Submit Claim for Approval
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Claims & Commission</h3>
              <span className="badge badge-success">
                <Award size={13} /> {formatINR(totalCommission)} Earned
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.date}</td>
                      <td>{exp.client}</td>
                      <td>{exp.category}</td>
                      <td>{formatINR(exp.amount)}</td>
                      <td>
                        <span
                          className={`badge ${
                            exp.status === 'Approved'
                              ? 'badge-success'
                              : exp.status === 'Rejected'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NEW DEAL MODAL */}
      {showDealModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="card-header">
              <h3 className="card-title">Create New Sales Opportunity</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowDealModal(false)}>
                Close
              </button>
            </div>
            <form onSubmit={handleDealSubmit}>
              <div className="form-grid" style={{ marginBottom: '0.85rem' }}>
                <div className="form-group">
                  <label>Client Company *</label>
                  <input
                    type="text"
                    value={dealForm.client}
                    onChange={(e) => setDealForm({ ...dealForm, client: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    value={dealForm.contactPerson}
                    onChange={(e) => setDealForm({ ...dealForm, contactPerson: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Product Suite</label>
                  <select value={dealForm.category} onChange={(e) => setDealForm({ ...dealForm, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Deal Value (₹) *</label>
                  <input
                    type="number"
                    min="1000"
                    value={dealForm.value}
                    onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Initial Stage</label>
                  <select value={dealForm.stage} onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}>
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Save Deal to Pipeline
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}