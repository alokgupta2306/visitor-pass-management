import * as XLSX from 'xlsx';

// Export visitors to Excel
export const exportVisitorsToExcel = (visitors) => {
  const data = visitors.map(v => ({
    'Full Name': v.fullName,
    'Email': v.email || 'N/A',
    'Phone': v.phone || 'N/A',
    'Host': v.host || 'N/A',
    'Purpose': v.purpose || 'N/A',
    'Status': v.status,
    'Created Date': new Date(v.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitors');
  
  // Auto-size columns
  const maxWidth = data.reduce((w, r) => Math.max(w, r['Full Name']?.length || 0), 10);
  worksheet['!cols'] = [
    { wch: maxWidth },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
    { wch: 12 },
    { wch: 20 },
  ];

  XLSX.writeFile(workbook, `Visitors_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export appointments to Excel
export const exportAppointmentsToExcel = (appointments) => {
  const data = appointments.map(a => ({
    'Visitor': a.visitor?.fullName || 'N/A',
    'Host Name': a.hostName,
    'Host Email': a.hostEmail || 'N/A',
    'Department': a.hostDepartment || 'N/A',
    'Scheduled Date': new Date(a.scheduleAt).toLocaleString(),
    'Status': a.status,
    'Notes': a.notes || 'N/A',
    'Created Date': new Date(a.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
  
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 30 },
    { wch: 20 },
  ];

  XLSX.writeFile(workbook, `Appointments_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export passes to Excel
export const exportPassesToExcel = (passes) => {
  const data = passes.map(p => ({
    'Visitor': p.visitor?.fullName || 'N/A',
    'Visitor Email': p.visitor?.email || 'N/A',
    'Status': p.status,
    'Valid From': new Date(p.validFrom).toLocaleString(),
    'Valid Until': new Date(p.validUntil).toLocaleString(),
    'Duration (hours)': p.expiryDuration,
    'Issued Date': new Date(p.createdAt).toLocaleString(),
    'PDF Path': p.pdfPath || 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Passes');
  
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 25 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 40 },
  ];

  XLSX.writeFile(workbook, `Passes_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export check logs to Excel
export const exportCheckLogsToExcel = (logs) => {
  const data = logs.map(l => ({
    'Visitor': l.visitor?.fullName || 'N/A',
    'Visitor Email': l.visitor?.email || 'N/A',
    'Action': l.action,
    'Location': l.location || 'N/A',
    'Timestamp': new Date(l.timestamp).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Check Logs');
  
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
  ];

  XLSX.writeFile(workbook, `CheckLogs_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export to CSV (alternative format)
export const exportToCSV = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export all data to a single Excel file with multiple sheets
export const exportAllDataToExcel = (visitors, appointments, passes, logs) => {
  const workbook = XLSX.utils.book_new();

  // Visitors sheet
  const visitorsData = visitors.map(v => ({
    'Full Name': v.fullName,
    'Email': v.email || 'N/A',
    'Phone': v.phone || 'N/A',
    'Host': v.host || 'N/A',
    'Purpose': v.purpose || 'N/A',
    'Status': v.status,
    'Created Date': new Date(v.createdAt).toLocaleString(),
  }));
  const visitorsSheet = XLSX.utils.json_to_sheet(visitorsData);
  XLSX.utils.book_append_sheet(workbook, visitorsSheet, 'Visitors');

  // Appointments sheet
  const appointmentsData = appointments.map(a => ({
    'Visitor': a.visitor?.fullName || 'N/A',
    'Host Name': a.hostName,
    'Host Email': a.hostEmail || 'N/A',
    'Department': a.hostDepartment || 'N/A',
    'Scheduled Date': new Date(a.scheduleAt).toLocaleString(),
    'Status': a.status,
    'Notes': a.notes || 'N/A',
  }));
  const appointmentsSheet = XLSX.utils.json_to_sheet(appointmentsData);
  XLSX.utils.book_append_sheet(workbook, appointmentsSheet, 'Appointments');

  // Passes sheet
  const passesData = passes.map(p => ({
    'Visitor': p.visitor?.fullName || 'N/A',
    'Status': p.status,
    'Valid From': new Date(p.validFrom).toLocaleString(),
    'Valid Until': new Date(p.validUntil).toLocaleString(),
    'Duration (hours)': p.expiryDuration,
  }));
  const passesSheet = XLSX.utils.json_to_sheet(passesData);
  XLSX.utils.book_append_sheet(workbook, passesSheet, 'Passes');

  // Check Logs sheet
  const logsData = logs.map(l => ({
    'Visitor': l.visitor?.fullName || 'N/A',
    'Action': l.action,
    'Location': l.location || 'N/A',
    'Timestamp': new Date(l.timestamp).toLocaleString(),
  }));
  const logsSheet = XLSX.utils.json_to_sheet(logsData);
  XLSX.utils.book_append_sheet(workbook, logsSheet, 'Check Logs');

  XLSX.writeFile(workbook, `VisitorManagement_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};