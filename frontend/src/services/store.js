// LocalStorage keys
const ROLE_KEY = 'foresite_role';
const CITIZEN_KEY = 'foresite_citizen';
const REPORTS_KEY = 'foresite_reports';

export const getRole = () => localStorage.getItem(ROLE_KEY);
export const setRole = (role) => {
  if (role) {
    localStorage.setItem(ROLE_KEY, role);
  } else {
    localStorage.removeItem(ROLE_KEY);
  }
  window.dispatchEvent(new Event('foresite_role_change'));
};

export const getCitizen = () => {
  const c = localStorage.getItem(CITIZEN_KEY);
  return c ? JSON.parse(c) : null;
};
export const setCitizen = (citizen) => localStorage.setItem(CITIZEN_KEY, JSON.stringify(citizen));

export const getReports = () => {
  const r = localStorage.getItem(REPORTS_KEY);
  return r ? JSON.parse(r) : [];
};

export const submitReport = (reportData) => {
  const reports = getReports();
  const count = reports.length + 1;
  const newReport = {
    ...reportData,
    id: `CR-${String(count).padStart(3, '0')}`,
    date: new Date().toISOString(),
    status: 'New',
    officerNotes: '',
  };
  reports.unshift(newReport);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  return newReport;
};

export const updateReportStatus = (id, newStatus, officerNotes) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === id);
  if (index > -1) {
    reports[index].status = newStatus;
    reports[index].officerNotes = officerNotes || '';
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }
};
