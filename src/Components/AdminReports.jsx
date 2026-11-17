import React, { useState } from 'react';
import {
  Download,
  Printer,
  TrendingUp,
  Award,
  IndianRupee,
  Percent,
  Calendar,
} from 'lucide-react';
import { CATEGORIES, formatINR, formatCompactINR } from '../data/mockData';
import './AdminReports.css';

export default function AdminReports({ users, deals, expenses }) {
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const staffList = users.filter((u) => u.role === 'staff');

  // Filter deals by staff & optional date range
  const filteredDeals = deals.filter((d) => {
    const matchStaff = selectedStaff === 'ALL' || d.staffId === selectedStaff;
    const matchFrom = !fromDate || d.closeDate >= fromDate;
    const matchTo = !toDate || d.closeDate <= toDate;
    return matchStaff && matchFrom && matchTo;
  });

  const wonDeals = filteredDeals.filter((d) => d.stage === 'Closed Won');
  const lostDeals = filteredDeals.filter((d) => d.stage === 'Closed Lost');

  const grossRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);
  const avgDealSize = wonDeals.length > 0 ? Math.round(grossRevenue / wonDeals.length) : 0;

  const decidedCount = wonDeals.length + lostDeals.length;
  const winRate = decidedCount > 0 ? Math.round((wonDeals.length / decidedCount) * 100) : 0;

  // Approved Field Expenses in scope
  const approvedExpensesTotal = expenses
    .filter((e) => e.status === 'Approved' && (selectedStaff === 'ALL' || e.staffId === selectedStaff))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  // Staff-wise Revenue, Commission & Net Contribution Matrix
  const staffAuditRows = staffList
    .filter((s) => selectedStaff === 'ALL' || s.id === selectedStaff)
    .map((staff) => {
      const sWon = wonDeals
        .filter((d) => d.staffId === staff.id)
        .reduce((sum, d) => sum + Number(d.value), 0);
      const sDealsCount = wonDeals.filter((d) => d.staffId === staff.id).length;

      // 4% base commission up to quota + 6% accelerator above quota
      const baseComm = Math.min(sWon, staff.quota) * 0.04;
      const bonusComm = Math.max(0, sWon - staff.quota) * 0.06;
      const totalCommission = Math.round(baseComm + bonusComm);

      const sExpenses = expenses
        .filter((e) => e.staffId === staff.id && e.status === 'Approved')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const netRevenue = sWon - totalCommission - sExpenses;
      const attainment = staff.quota > 0 ? Math.round((sWon / staff.quota) * 100) : 0;

      return {
        ...staff,
        sWon,
        sDealsCount,
        totalCommission,
        sExpenses,
        netRevenue,
        attainment,
      };
    });

  const totalPayoutCommission = staffAuditRows.reduce((s, r) => s + r.totalCommission, 0);
  const totalNetRevenue = grossRevenue - totalPayoutCommission - approvedExpensesTotal;

  // Export Comprehensive Financial CSV
  const handleDownloadAuditCSV = () => {
    const headers = [
      'Staff Name',
      'Territory',
      'Deals Won',
      'Gross Revenue (INR)',
      'Monthly Quota (INR)',
      'Attainment (%)',
      'Commission Payout (INR)',
      'Approved Expenses (INR)',
      'Net Contribution (INR)',
    ];

    const rows = staffAuditRows.map((r) => [
      r.name,
      `"${r.territory}"`,
      r.sDealsCount,
      r.sWon,
      r.quota,
      `${r.attainment}%`,
      r.totalCommission,
      r.sExpenses,
      r.netRevenue,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SalesPulse_Revenue_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div>
      {/* Filter & Export Action Bar */}
      <div className="card reports-filter-bar">
        <div className="reports-filter-controls">
          <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
            <option value="ALL">All Sales Representatives</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.territory})
              </option>
            ))}
          </select>

          <div className="date-range-group">
            <Calendar size={14} />
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {(fromDate || toDate || selectedStaff !== 'ALL') && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedStaff('ALL');
                setFromDate('');
                setToDate('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="reports-filter-controls">
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Printer size={15} /> Print Report
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownloadAuditCSV}>
            <Download size={15} /> Export Audit CSV
          </button>
        </div>
      </div>

      {/* Top Financial KPI Cards */}
      <div className="reports-summary-grid">
        <div className="report-stat-card">
          <div className="report-stat-header">
            <span>Gross Closed Revenue</span>
            <IndianRupee size={16} color="var(--primary)" />
          </div>
          <div className="report-stat-num">{formatCompactINR(grossRevenue)}</div>
          <div className="report-stat-note">
            Across {wonDeals.length} closed-won enterprise deals
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-header">
            <span>Average Deal Size</span>
            <TrendingUp size={16} color="var(--success)" />
          </div>
          <div className="report-stat-num">{formatCompactINR(avgDealSize)}</div>
          <div className="report-stat-note">Win Conversion Rate: {winRate}%</div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-header">
            <span>Total Commission Liability</span>
            <Award size={16} color="var(--warning)" />
          </div>
          <div className="report-stat-num" style={{ color: 'var(--warning)' }}>
            {formatINR(totalPayoutCommission)}
          </div>
          <div className="report-stat-note">4% Base + 6% Quota Accelerator</div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-header">
            <span>Net Revenue After Payouts</span>
            <Percent size={16} color="var(--success)" />
          </div>
          <div className="report-stat-num" style={{ color: 'var(--success)' }}>
            {formatCompactINR(totalNetRevenue)}
          </div>
          <div className="report-stat-note">
            After {formatINR(approvedExpensesTotal)} approved field claims
          </div>
        </div>
      </div>

      {/* Territory & Product Revenue Breakdown */}
      <div className="reports-split-row">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Territory Performance Breakdown</h3>
          </div>
          {staffAuditRows.map((row) => {
            const sharePct =
              grossRevenue > 0 ? Math.round((row.sWon / grossRevenue) * 100) : 0;
            return (
              <div key={row.id} className="territory-bar-item">
                <div className="territory-bar-top">
                  <span>
                    <strong>{row.territory}</strong> ({row.name})
                  </span>
                  <strong>
                    {formatCompactINR(row.sWon)} ({sharePct}%)
                  </strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${sharePct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Product Suite Revenue Share</h3>
          </div>
          {CATEGORIES.map((cat) => {
            const catRev = wonDeals
              .filter((d) => d.category === cat)
              .reduce((s, d) => s + Number(d.value), 0);
            const catPct = grossRevenue > 0 ? Math.round((catRev / grossRevenue) * 100) : 0;

            return (
              <div key={cat} className="territory-bar-item">
                <div className="territory-bar-top">
                  <span>{cat}</span>
                  <strong>
                    {formatCompactINR(catRev)} ({catPct}%)
                  </strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill won"
                    style={{ width: `${catPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Commission & Net Margin Audit Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Staff Revenue, Commission & Net Contribution Ledger</h3>
          <span className="badge badge-primary">FY 2026-27 Audit</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sales Representative</th>
                <th>Deals Won</th>
                <th>Gross Revenue</th>
                <th>Quota Attainment</th>
                <th>Commission Earned</th>
                <th>Approved Expenses</th>
                <th>Net Contribution</th>
              </tr>
            </thead>
            <tbody>
              {staffAuditRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {row.territory}
                    </div>
                  </td>
                  <td>{row.sDealsCount}</td>
                  <td>
                    <strong>{formatINR(row.sWon)}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        row.attainment >= 100 ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {row.attainment}%
                    </span>
                  </td>
                  <td style={{ color: 'var(--warning)', fontWeight: 700 }}>
                    {formatINR(row.totalCommission)}
                  </td>
                  <td>{formatINR(row.sExpenses)}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>
                    {formatINR(row.netRevenue)}
                  </td>
                </tr>
              ))}
              <tr className="table-total-row">
                <td>TOTAL TEAM SUMMARY</td>
                <td>{wonDeals.length}</td>
                <td>{formatINR(grossRevenue)}</td>
                <td>—</td>
                <td>{formatINR(totalPayoutCommission)}</td>
                <td>{formatINR(approvedExpensesTotal)}</td>
                <td>{formatINR(totalNetRevenue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}