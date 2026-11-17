export const STORAGE_KEY = 'salespulse_enterprise_modular_v1';

export const STAGES = [
  'New Lead',
  'Demo / Meeting',
  'Proposal Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

export const CATEGORIES = [
  'Enterprise SaaS',
  'Cloud ERP Suite',
  'HR & Payroll Pro',
  'POS & Retail Billing',
  'Cybersecurity Shield',
];

export const formatINR = (num) => {
  return '₹' + Number(num || 0).toLocaleString('en-IN');
};

export const formatCompactINR = (num) => {
  const n = Number(num || 0);
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n.toLocaleString('en-IN');
};

export const getTodayDate = () => new Date().toISOString().split('T')[0];

export const getOffsetDate = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_STATE = {
  users: [
    {
      id: 'admin-1',
      name: 'Vikram Singhania',
      role: 'admin',
      designation: 'VP of Sales & Revenue',
      territory: 'National HQ (Mumbai)',
      quota: 0,
      status: 'Online',
      workMode: 'Office',
      checkInTime: Date.now() - 1000 * 60 * 145,
    },
    {
      id: 'staff-1',
      name: 'Aarav Sharma',
      role: 'staff',
      designation: 'Senior Enterprise AE',
      territory: 'North India (Delhi NCR)',
      quota: 650000,
      status: 'Checked In',
      workMode: 'Client Field Visit',
      checkInTime: Date.now() - 1000 * 60 * 195,
    },
    {
      id: 'staff-2',
      name: 'Priya Nair',
      role: 'staff',
      designation: 'Regional Sales Lead',
      territory: 'South India (Bengaluru)',
      quota: 600000,
      status: 'Checked In',
      workMode: 'Office',
      checkInTime: Date.now() - 1000 * 60 * 160,
    },
    {
      id: 'staff-3',
      name: 'Rohan Kulkarni',
      role: 'staff',
      designation: 'Account Executive',
      territory: 'West India (Pune)',
      quota: 500000,
      status: 'Checked In',
      workMode: 'Remote',
      checkInTime: Date.now() - 1000 * 60 * 110,
    },
    {
      id: 'staff-4',
      name: 'Ananya Verma',
      role: 'staff',
      designation: 'Business Dev Manager',
      territory: 'East India (Kolkata)',
      quota: 450000,
      status: 'Offline',
      workMode: 'Offline',
      checkInTime: null,
    },
  ],
  deals: [
    {
      id: 'd-101',
      staffId: 'staff-1',
      client: 'Apex Logistics Pvt Ltd',
      contactPerson: 'Rajesh Khanna',
      category: 'Cloud ERP Suite',
      value: 285000,
      stage: 'Closed Won',
      closeDate: getOffsetDate(-2),
    },
    {
      id: 'd-102',
      staffId: 'staff-1',
      client: 'MetroMed Hospitals',
      contactPerson: 'Dr. Sneha Kapoor',
      category: 'Enterprise SaaS',
      value: 410000,
      stage: 'Closed Won',
      closeDate: getOffsetDate(-5),
    },
    {
      id: 'd-103',
      staffId: 'staff-2',
      client: 'Kaveri Tech Solutions',
      contactPerson: 'Karthik Rao',
      category: 'Cybersecurity Shield',
      value: 340000,
      stage: 'Closed Won',
      closeDate: getOffsetDate(-1),
    },
    {
      id: 'd-104',
      staffId: 'staff-2',
      client: 'Malabar Gold Exports',
      contactPerson: 'Faisal Menon',
      category: 'HR & Payroll Pro',
      value: 195000,
      stage: 'Negotiation',
      closeDate: getOffsetDate(3),
    },
    {
      id: 'd-105',
      staffId: 'staff-3',
      client: 'Sahyadri Agro Foods',
      contactPerson: 'Nitin Deshmukh',
      category: 'POS & Retail Billing',
      value: 240000,
      stage: 'Closed Won',
      closeDate: getOffsetDate(-3),
    },
    {
      id: 'd-106',
      staffId: 'staff-3',
      client: 'Deccan Auto Components',
      contactPerson: 'Suresh Joshi',
      category: 'Cloud ERP Suite',
      value: 320000,
      stage: 'Proposal Sent',
      closeDate: getOffsetDate(5),
    },
    {
      id: 'd-107',
      staffId: 'staff-4',
      client: 'Bengal Tea Estates',
      contactPerson: 'Subhash Bose',
      category: 'HR & Payroll Pro',
      value: 210000,
      stage: 'Closed Won',
      closeDate: getOffsetDate(-4),
    },
  ],
  activities: [
    {
      id: 'act-1',
      staffId: 'staff-1',
      date: getTodayDate(),
      type: 'Client Meeting',
      client: 'Horizon FinServe',
      outcome: 'Completed live security architecture demo with VP Engineering.',
      callsCount: 8,
      followUpDate: getTodayDate(),
      status: 'Follow-up Due',
    },
    {
      id: 'act-2',
      staffId: 'staff-2',
      date: getTodayDate(),
      type: 'Negotiation Call',
      client: 'Malabar Gold Exports',
      outcome: 'Agreed on 8% annual billing discount; final sign-off tomorrow.',
      callsCount: 11,
      followUpDate: getOffsetDate(1),
      status: 'On Track',
    },
    {
      id: 'act-3',
      staffId: 'staff-3',
      date: getOffsetDate(-1),
      type: 'Proposal Review',
      client: 'Deccan Auto Components',
      outcome: 'Sent revised quote including ERP migration support.',
      callsCount: 9,
      followUpDate: getOffsetDate(-1),
      status: 'Overdue Follow-up',
    },
  ],
  expenses: [
    {
      id: 'exp-1',
      staffId: 'staff-1',
      date: getTodayDate(),
      category: 'Client Lunch / Hospitality',
      client: 'Apex Logistics Pvt Ltd',
      amount: 3450,
      notes: 'Contract signing lunch with CFO & IT Director',
      status: 'Pending',
    },
    {
      id: 'exp-2',
      staffId: 'staff-2',
      date: getOffsetDate(-1),
      category: 'Outstation Flight / Cab',
      client: 'Kaveri Tech Solutions',
      amount: 6800,
      notes: 'Airport transfer & client site visit in Electronic City',
      status: 'Approved',
    },
  ],
};