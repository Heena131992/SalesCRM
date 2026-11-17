import React, { useState } from 'react';
import { Plus, Kanban, List, Trash2 } from 'lucide-react';
import {
  STAGES,
  CATEGORIES,
  formatINR,
  formatCompactINR,
  getTodayDate,
} from '../data/mockData';
import './AdminMasterPipeline.css';

export default function AdminMasterPipeline({
  users,
  deals,
  onAddDeal,
  onUpdateDealStage,
  onReassignDeal,
  onDeleteDeal,
}) {
  const [viewMode, setViewMode] = useState('kanban');
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const staffList = users.filter((u) => u.role === 'staff');
  const getStaffName = (id) => users.find((u) => u.id === id)?.name || 'Unassigned';

  const [dealForm, setDealForm] = useState({
    client: '',
    contactPerson: '',
    staffId: staffList[0]?.id || 'staff-1',
    category: CATEGORIES[0],
    value: '',
    stage: 'New Lead',
  });

  const filteredDeals = deals.filter((d) => {
    const matchOwner = ownerFilter === 'ALL' || d.staffId === ownerFilter;
    const matchCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    const matchText = d.client.toLowerCase().includes(search.toLowerCase());
    return matchOwner && matchCat && matchText;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!dealForm.client || !dealForm.value) return;
    onAddDeal({
      ...dealForm,
      value: Number(dealForm.value),
      closeDate: getTodayDate(),
    });
    setDealForm({
      client: '',
      contactPerson: '',
      staffId: staffList[0]?.id || 'staff-1',
      category: CATEGORIES[0],
      value: '',
      stage: 'New Lead',
    });
    setShowNewModal(false);
  };

  return (
    <div>
      {/* Master Pipeline Filter & View Bar */}
      <div className="card pipeline-header-bar">
        <div className="pipeline-filters">
          <input
            type="text"
            placeholder="Search client company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
            <option value="ALL">All Sales Reps ({deals.length})</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="ALL">All Product Lines</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="pipeline-filters">
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List size={14} /> Ledger Table
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowNewModal(true)}>
            <Plus size={15} /> Assign New Deal
          </button>
        </div>
      </div>

      {/* VIEW 1: MASTER KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div className="card">
          <div className="master-kanban-grid">
            {STAGES.map((stage) => {
              const colDeals = filteredDeals.filter((d) => d.stage === stage);
              const colTotal = colDeals.reduce((s, d) => s + Number(d.value), 0);

              return (
                <div key={stage} className="master-kanban-col">
                  <div className="master-col-top">
                    <div className="master-col-title-row">
                      <span>{stage}</span>
                      <span className="badge badge-primary">{colDeals.length}</span>
                    </div>
                    <div className="master-col-sum">{formatCompactINR(colTotal)}</div>
                  </div>

                  {colDeals.map((deal) => (
                    <div key={deal.id} className="master-deal-card">
                      <h4>{deal.client}</h4>
                      <div className="master-deal-product">{deal.category}</div>
                      <div className="master-deal-price">{formatINR(deal.value)}</div>

                      <div className="master-deal-controls">
                        <select
                          className="mini-inline-select"
                          value={deal.staffId}
                          onChange={(e) => onReassignDeal(deal.id, e.target.value)}
                          title="Reassign Deal Owner"
                        >
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              Owner: {s.name}
                            </option>
                          ))}
                        </select>

                        <select
                          className="mini-inline-select"
                          value={deal.stage}
                          onChange={(e) => onUpdateDealStage(deal.id, e.target.value)}
                          title="Move Deal Stage"
                        >
                          {STAGES.map((st) => (
                            <option key={st} value={st}>
                              Stage: {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: LEDGER TABLE VIEW */
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Product Line</th>
                  <th>Assigned Owner</th>
                  <th>Pipeline Stage</th>
                  <th>Deal Value</th>
                  <th>Close Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td><strong>{deal.client}</strong></td>
                    <td>{deal.category}</td>
                    <td>
                      <select
                        value={deal.staffId}
                        onChange={(e) => onReassignDeal(deal.id, e.target.value)}
                      >
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={deal.stage}
                        onChange={(e) => onUpdateDealStage(deal.id, e.target.value)}
                      >
                        {STAGES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td><strong>{formatINR(deal.value)}</strong></td>
                    <td>{deal.closeDate}</td>
                    <td>
                      {onDeleteDeal && (
                        <button
                          className="btn btn-danger-soft btn-sm"
                          onClick={() => onDeleteDeal(deal.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSIGN NEW DEAL MODAL */}
      {showNewModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="card-header">
              <h3 className="card-title">Create & Assign Enterprise Deal</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowNewModal(false)}>
                Close
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
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
                  <label>Assign To Staff *</label>
                  <select
                    value={dealForm.staffId}
                    onChange={(e) => setDealForm({ ...dealForm, staffId: e.target.value })}
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Product Suite</label>
                  <select
                    value={dealForm.category}
                    onChange={(e) => setDealForm({ ...dealForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
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
                  <select
                    value={dealForm.stage}
                    onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}
                  >
                    {STAGES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Assign Deal to Pipeline
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}