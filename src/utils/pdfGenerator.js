import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// 1. Staff Monthly Commission & Payout Slip PDF
export function downloadCommissionSlipPDF(user, deals = []) {
  const doc = new jsPDF();
  const wonDeals = deals.filter((d) => d.staffId === user.id && d.stage === 'Closed Won');
  const closedRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const quota = Number(user.quota || 0);

  // Tiered Commission Calculation (4% up to quota, 6% above quota)
  const baseEligible = Math.min(closedRevenue, quota);
  const bonusEligible = Math.max(0, closedRevenue - quota);
  const baseCommission = Math.round(baseEligible * 0.04);
  const acceleratorBonus = Math.round(bonusEligible * 0.06);
  const totalCommission = baseCommission + acceleratorBonus;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('SALESPULSE ENTERPRISE CRM', 14, 17);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Monthly Sales Commission & Payout Statement', 14, 25);

  // Employee Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(`Employee Name: ${user.name}`, 14, 48);
  doc.text(`Designation: ${user.designation || 'Sales Executive'}`, 14, 55);
  doc.text(`Territory: ${user.territory || 'India'}`, 14, 62);
  doc.text(`Generated Date: ${new Date().toLocaleDateString('en-IN')}`, 140, 48);

  // Summary Table
  autoTable(doc, {
    startY: 72,
    head: [['Metric', 'Amount (INR)']],
    body: [
      ['Monthly Sales Quota', `Rs. ${quota.toLocaleString('en-IN')}`],
      ['Total Closed Won Revenue', `Rs. ${closedRevenue.toLocaleString('en-IN')}`],
      ['Base Commission (4% up to Quota)', `Rs. ${baseCommission.toLocaleString('en-IN')}`],
      ['Accelerator Bonus (6% above Quota)', `Rs. ${acceleratorBonus.toLocaleString('en-IN')}`],
      ['Net Commission Payout', `Rs. ${totalCommission.toLocaleString('en-IN')}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
  });

  // Closed Deals Breakdown
  if (wonDeals.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [['Client Name', 'Product Suite', 'Stage', 'Deal Value (INR)']],
      body: wonDeals.map((d) => [
        d.client,
        d.category || 'Enterprise Suite',
        d.stage,
        `Rs. ${Number(d.value).toLocaleString('en-IN')}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
    });
  }

  doc.save(`${user.name.replace(/\s+/g, '_')}_Commission_Slip.pdf`);
}

// 2. Client Deal Quote / Proposal PDF
export function downloadDealQuotePDF(deal, ownerName = 'SalesPulse Representative') {
  const doc = new jsPDF();

  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('COMMERCIAL PROPOSAL & QUOTE', 14, 17);
  doc.setFontSize(10);
  doc.text('SalesPulse Enterprise Solutions Pvt. Ltd.', 14, 25);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(`Prepared For: ${deal.client}`, 14, 48);
  doc.text(`Account Owner: ${ownerName}`, 14, 55);
  doc.text(`Quote Date: ${new Date().toLocaleDateString('en-IN')}`, 145, 48);
  doc.text(`Pipeline Stage: ${deal.stage}`, 145, 55);

  const baseValue = Number(deal.value || 0);
  const gst = Math.round(baseValue * 0.18);
  const grandTotal = baseValue + gst;

  autoTable(doc, {
    startY: 68,
    head: [['Description', 'Category', 'Amount (INR)']],
    body: [
      ['Enterprise Software License & Onboarding', deal.category || 'Core CRM', `Rs. ${baseValue.toLocaleString('en-IN')}`],
      ['GST (18%)', 'Tax', `Rs. ${gst.toLocaleString('en-IN')}`],
      ['Total Payable Amount', '-', `Rs. ${grandTotal.toLocaleString('en-IN')}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a system-generated commercial quotation valid for 15 days.', 14, doc.lastAutoTable.finalY + 15);

  doc.save(`${deal.client.replace(/\s+/g, '_')}_Quote.pdf`);
}

export const downloadExecutiveReportPDF = (users = [], deals = [], expenses = []) => {
  const doc = new jsPDF();
  const staffList = users.filter((u) => u.role === 'staff');
  const wonDeals = deals.filter((d) => d.stage === 'Closed Won');
  const totalRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const pipelineValue = deals
    .filter((d) => !['Closed Won', 'Closed Lost'].includes(d.stage))
    .reduce((sum, d) => sum + Number(d.value || 0), 0);
  const approvedExpenses = expenses
    .filter((e) => e.status === 'Approved')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  doc.setFontSize(18);
  doc.text('SalesPulse CRM - Executive Revenue Report', 14, 22);

  doc.setFontSize(10);
  doc.text(`Generated On: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);
  doc.line(14, 34, 196, 34);

  // Company KPIs
  doc.setFontSize(12);
  doc.text('1. Company Performance Summary', 14, 44);
  doc.setFontSize(10);
  doc.text(`Total Closed Won Revenue: Rs. ${totalRevenue.toLocaleString('en-IN')}`, 14, 52);
  doc.text(`Active Pipeline Value: Rs. ${pipelineValue.toLocaleString('en-IN')}`, 14, 59);
  doc.text(`Approved Field Expenses: Rs. ${approvedExpenses.toLocaleString('en-IN')}`, 14, 66);

  // Staff Leaderboard
  doc.setFontSize(12);
  doc.text('2. Sales Representative Breakdown', 14, 80);
  doc.setFontSize(10);

  let y = 89;
  staffList.forEach((staff, idx) => {
    const rev = wonDeals
      .filter((d) => d.staffId === staff.id)
      .reduce((s, d) => s + Number(d.value || 0), 0);
    doc.text(
      `${idx + 1}. ${staff.name} (${staff.territory}) — Closed: Rs. ${rev.toLocaleString('en-IN')} / Quota: Rs. ${Number(staff.quota || 0).toLocaleString('en-IN')}`,
      14,
      y
    );
    y += 8;
  });

  doc.save(`SalesPulse_Executive_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};