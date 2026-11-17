import React from 'react';
import { STAGES, CATEGORIES, formatCompactINR } from '../data/mockData';
import './Charts.css';

export function RevenueVsQuotaChart({ staffList, deals }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Staff Revenue vs. Monthly Quota</h3>
        <span className="badge badge-primary">Closed Won</span>
      </div>
      <div className="chart-stack">
        {staffList.map((staff) => {
          const won = deals
            .filter((d) => d.staffId === staff.id && d.stage === 'Closed Won')
            .reduce((sum, d) => sum + Number(d.value), 0);
          const pct = staff.quota > 0 ? Math.min(100, Math.round((won / staff.quota) * 100)) : 0;

          return (
            <div key={staff.id}>
              <div className="chart-row-header">
                <strong>{staff.name}</strong>
                <span>
                  {formatCompactINR(won)} / {formatCompactINR(staff.quota)} ({pct}%)
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PipelineFunnelChart({ deals }) {
  const maxStageVal = Math.max(
    1,
    ...STAGES.map((stage) =>
      deals.filter((d) => d.stage === stage).reduce((s, d) => s + Number(d.value), 0)
    )
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Deal Pipeline Value by Stage</h3>
        <span className="badge badge-success">Live Funnel</span>
      </div>
      <div className="chart-stack">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const total = stageDeals.reduce((s, d) => s + Number(d.value), 0);
          const widthPct = Math.round((total / maxStageVal) * 100);
          const fillClass =
            stage === 'Closed Lost' ? 'lost' : stage === 'Closed Won' ? 'won' : '';

          return (
            <div key={stage}>
              <div className="chart-row-header">
                <span>
                  {stage} ({stageDeals.length})
                </span>
                <strong>{formatCompactINR(total)}</strong>
              </div>
              <div className="progress-track">
                <div
                  className={`progress-fill ${fillClass}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CategoryMixChart({ deals }) {
  const wonDeals = deals.filter((d) => d.stage === 'Closed Won');
  const totalWon = Math.max(
    1,
    wonDeals.reduce((s, d) => s + Number(d.value), 0)
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Revenue by Product Line</h3>
      </div>
      <div className="chart-stack">
        {CATEGORIES.map((cat) => {
          const sum = wonDeals
            .filter((d) => d.category === cat)
            .reduce((s, d) => s + Number(d.value), 0);
          const share = Math.round((sum / totalWon) * 100);

          return (
            <div key={cat} className="category-mix-row">
              <span>{cat}</span>
              <div>
                <strong>{formatCompactINR(sum)}</strong>{' '}
                <span className="category-share-text">({share}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}