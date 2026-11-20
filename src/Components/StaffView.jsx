import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Square,
  Plus,
  PhoneCall,
  IndianRupee,
  ArrowRight,
  Award,
  Download,
  Search,
  Mic,
  X,
} from 'lucide-react';
import { STAGES, CATEGORIES, formatINR, formatCompactINR, getTodayDate } from '../data/mockData';
import { downloadCommissionSlipPDF, downloadDealQuotePDF } from '../utils/pdfGenerator';
import './StaffView.css';

export default function StaffView({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  currentUser,
  deals = [],
  activities = [],
  expenses = [],
  onToggleCheckIn,
  onAddDeal,
  onAdvanceDeal,
  onAddActivity,
  onAddExpense,
}) {
  const [elapsed, setElapsed] = useState('00:00:00');
  const [workMode, setWorkMode] = useState('Client Field Visit');
  const [showDealModal, setShowDealModal] = useState(false);

  // Fully independent + parent-synced tab state (Ab click 100% kaam karega)
  const [currentTab, setCurrentTab] = useState(propActiveTab || 'overview');

  useEffect(() => {
    if (propActiveTab) {
      setCurrentTab(propActiveTab);
    }
  }, [propActiveTab]);

  const handleSwitchTab = (tabId) => {
    setCurrentTab(tabId);
    if (typeof propSetActiveTab === 'function') {
      propSetActiveTab(tabId);
    }
  };

  // Search Bar & Voice Mic State
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');

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

  // Live Search Results (Deals, Work Logs, Expenses, aur Quick Actions)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results = [];

    myDeals.forEach((d) => {
      if (
        d.client?.toLowerCase().includes(q) ||
        d.stage?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Deal',
          title: d.client,
          subtitle: `${d.stage} • ${formatINR(d.value)}`,
          tab: 'pipeline',
        });
      }
    });

    myActivities.forEach((a) => {
      if (
        a.client?.toLowerCase().includes(q) ||
        a.outcome?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Work Log',
          title: a.client,
          subtitle: `${a.type} • ${a.date}`,
          tab: 'overview',
        });
      }
    });

    myExpenses.forEach((e) => {
      if (
        e.client?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Expense',
          title: e.client,
          subtitle: `${e.category} • ${formatINR(e.amount)}`,
          tab: 'expenses',
        });
      }
    });

    return results.slice(0, 6);
  }, [searchQuery, myDeals, myActivities, myExpenses]);

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceMessage('Voice search is not supported in this browser.');
      setTimeout(() => setVoiceMessage(''), 2500);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    setIsListening(true);
    setVoiceMessage('Listening...');
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      setVoiceMessage('');
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceMessage('');
    };
    recognition.onend = () => {
      setIsListening(false);
      setVoiceMessage('');
    };
    recognition.start();
  };

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

  // Single-row compact button styling
  const singleRowBtnStyle = {
    padding: '8px 6px',
    fontSize: '11.5px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    borderRadius: '10px',
    minWidth: 0,
    cursor: 'pointer',
  };

  const pillTabs = [
    { id: 'overview', label: 'Work Log' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'expenses', label: 'Expenses' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* FULLY FUNCTIONAL: Deep Navy Top Pill Tabs + White Search Bar with Mic */}
      <div
        style={{
          background: '#081226',
          padding: '14px 16px 18px',
          borderRadius: '18px',
          marginBottom: '16px',
          boxShadow: '0 4px 18px rgba(8, 18, 38, 0.16)',
          position: 'relative',
          zIndex: 60,
        }}
      >
        {/* Centered Pill Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
          }}
        >
          {pillTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSwitchTab(tab.id);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0f172a' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                  pointerEvents: 'auto',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* White Pill Search Bar with Mic Icon */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: '14px',
              padding: '6px 14px',
              gap: '10px',
            }}
          >
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={voiceMessage || 'Search deals, logs, expenses...'}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                padding: '6px 0',
                fontSize: '0.95rem',
                color: '#0f172a',
                background: 'transparent',
                pointerEvents: 'auto',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Voice Search"
              style={{
                border: 'none',
                background: 'transparent',
                color: isListening ? '#ef4444' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <Mic size={18} />
            </button>
          </div>

          {/* Live Search Dropdown */}
          {searchQuery.trim() !== '' && (
            <div
              style={{
                position: 'absolute',
                top: '112%',
                left: 0,
                right: 0,
                background: '#ffffff',
                borderRadius: '14px',
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.25)',
                border: '1px solid #e2e8f0',
                zIndex: 200,
                overflow: 'hidden',
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleSwitchTab(item.tab);
                      setSearchQuery('');
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: '11px 14px',
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
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

        {/* Work Mode Selector (Jab Checked Out ho tab) */}
        {currentUser.status !== 'Checked In' && (
          <div style={{ width: '100%', marginTop: '8px' }}>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Client Field Visit">Client Field Visit</option>
              <option value="Office">Office</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        )}

        {/* Teeno Action Buttons Ek Hi Line Mein */}
        <div
          className="shift-controls"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1.3fr',
            gap: '6px',
            width: '100%',
            marginTop: '10px',
          }}
        >
          <button
            type="button"
            className={`btn ${currentUser.status === 'Checked In' ? 'btn-danger-soft' : 'btn-success'}`}
            style={singleRowBtnStyle}
            onClick={() => onToggleCheckIn && onToggleCheckIn(currentUser.id, workMode)}
          >
            {currentUser.status === 'Checked In' ? (
              <><Square size={13} /> End Shift</>
            ) : (
              <><Play size={13} /> Start Shift</>
            )}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={singleRowBtnStyle}
            onClick={() => setShowDealModal(true)}
          >
            <Plus size={14} /> New Deal
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={singleRowBtnStyle}
            onClick={() => downloadCommissionSlipPDF(currentUser, deals)}
          >
            <Download size={13} /> Commission PDF
          </button>
        </div>
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
      {currentTab === 'overview' && (
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
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">My Recent Work Logs</h3>
              <span className="badge badge-primary">{myActivities.length} Logs</span>
            </div>

            {myActivities.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  background: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.88rem',
                }}
              >
                No work logs submitted yet. Fill out the form above to log your first client update!
              </div>
            ) : (
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
            )}
          </div>
        </>
      )}

      {/* TAB 2: KANBAN PIPELINE */}
      {currentTab === 'pipeline' && (
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
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        {stage !== 'Closed Won' && stage !== 'Closed Lost' && (
                          <button
                            className="btn btn-outline btn-sm advance-stage-btn"
                            onClick={() => onAdvanceDeal && onAdvanceDeal(deal.id)}
                          >
                            Advance <ArrowRight size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => downloadDealQuotePDF(deal, currentUser)}
                          title="Download Quote PDF"
                        >
                          <Download size={13} /> Quote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES & COMMISSION */}
      {currentTab === 'expenses' && (
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
            {myExpenses.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  background: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.88rem',
                }}
              >
                No expense claims submitted yet.
              </div>
            ) : (
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
            )}
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