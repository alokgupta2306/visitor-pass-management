import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState({ 
    visitors: 0, 
    appointments: 0, 
    passes: 0, 
    recentLogs: [] 
  });
  const [analytics, setAnalytics] = useState({
    visitorsByStatus: [],
    appointmentsByStatus: [],
    passesByStatus: [],
    checkInsOverTime: [],
    topHosts: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [allData, setAllData] = useState({
    visitors: [],
    appointments: [],
    passes: [],
    logs: []
  });

  const calculateAnalytics = useCallback((visitors, appointments, passes, logs) => {
    const visitorsByStatus = [
      { name: 'Approved', value: visitors.filter(v => v.status === 'approved').length, color: '#51cf66' },
      { name: 'Pending', value: visitors.filter(v => v.status === 'pending').length, color: '#ffd43b' },
      { name: 'Denied', value: visitors.filter(v => v.status === 'denied').length, color: '#ff6b6b' },
    ].filter(item => item.value > 0);

    const appointmentsByStatus = [
      { name: 'Scheduled', value: appointments.filter(a => a.status === 'scheduled').length },
      { name: 'Approved', value: appointments.filter(a => a.status === 'approved').length },
      { name: 'Declined', value: appointments.filter(a => a.status === 'declined').length },
      { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length },
    ];

    const passesByStatus = [
      { name: 'Issued', value: passes.filter(p => p.status === 'issued').length, color: '#51cf66' },
      { name: 'Expired', value: passes.filter(p => p.status === 'expired').length, color: '#ffd43b' },
      { name: 'Revoked', value: passes.filter(p => p.status === 'revoked').length, color: '#ff6b6b' },
    ].filter(item => item.value > 0);

    const days = parseInt(dateRange);
    const checkInsOverTime = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const checkIns = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= date && logDate < nextDate && log.action === 'checkin';
      }).length;
      
      const checkOuts = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= date && logDate < nextDate && log.action === 'checkout';
      }).length;
      
      checkInsOverTime.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Check-ins': checkIns,
        'Check-outs': checkOuts,
      });
    }

    const hostCounts = {};
    appointments.forEach(apt => {
      const host = apt.hostName || 'Unknown';
      hostCounts[host] = (hostCounts[host] || 0) + 1;
    });
    
    const topHosts = Object.entries(hostCounts)
      .map(([name, count]) => ({ name, appointments: count }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);

    setAnalytics({
      visitorsByStatus,
      appointmentsByStatus,
      passesByStatus,
      checkInsOverTime,
      topHosts,
    });
  }, [dateRange]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const summaryRes = await api.get('/reports/summary');
      setSummary(summaryRes.data);

      const [visitorsRes, appointmentsRes, passesRes, logsRes] = await Promise.all([
        api.get('/visitors'),
        api.get('/appointments'),
        api.get('/passes'),
        api.get('/check-logs'),
      ]);

      const visitors = visitorsRes.data;
      const appointments = appointmentsRes.data;
      const passes = passesRes.data;
      const logs = logsRes.data;

      setAllData({ visitors, appointments, passes, logs });
      calculateAnalytics(visitors, appointments, passes, logs);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateAnalytics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportAllDataToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Visitors Sheet
    const visitorsData = allData.visitors.map(v => ({
      'Full Name': v.fullName,
      'Email': v.email || 'N/A',
      'Phone': v.phone || 'N/A',
      'Host': v.host || 'N/A',
      'Purpose': v.purpose || 'N/A',
      'Status': v.status,
      'Created At': new Date(v.createdAt).toLocaleString()
    }));
    const visitorsSheet = XLSX.utils.json_to_sheet(visitorsData);
    XLSX.utils.book_append_sheet(workbook, visitorsSheet, 'Visitors');
    
    // Appointments Sheet
    const appointmentsData = allData.appointments.map(a => ({
      'Visitor': a.visitor?.fullName || 'N/A',
      'Host Name': a.hostName,
      'Department': a.hostDepartment || 'N/A',
      'Scheduled At': new Date(a.scheduleAt).toLocaleString(),
      'Status': a.status,
      'Notes': a.notes || 'N/A',
      'Created At': new Date(a.createdAt).toLocaleString()
    }));
    const appointmentsSheet = XLSX.utils.json_to_sheet(appointmentsData);
    XLSX.utils.book_append_sheet(workbook, appointmentsSheet, 'Appointments');
    
    // Passes Sheet
    const passesData = allData.passes.map(p => ({
      'Visitor': p.visitor?.fullName || 'N/A',
      'Status': p.status,
      'Issued At': new Date(p.createdAt).toLocaleString()
    }));
    const passesSheet = XLSX.utils.json_to_sheet(passesData);
    XLSX.utils.book_append_sheet(workbook, passesSheet, 'Passes');
    
    // Check Logs Sheet
    const logsData = allData.logs.map(l => ({
      'Visitor': l.visitor?.fullName || 'Unknown',
      'Action': l.action,
      'Location': l.location || 'N/A',
      'Timestamp': new Date(l.timestamp).toLocaleString()
    }));
    const logsSheet = XLSX.utils.json_to_sheet(logsData);
    XLSX.utils.book_append_sheet(workbook, logsSheet, 'Check Logs');
    
    // Summary Sheet
    const summaryData = [
      { Metric: 'Total Visitors', Value: allData.visitors.length },
      { Metric: 'Total Appointments', Value: allData.appointments.length },
      { Metric: 'Total Passes', Value: allData.passes.length },
      { Metric: 'Total Check Logs', Value: allData.logs.length },
      { Metric: 'Approved Visitors', Value: allData.visitors.filter(v => v.status === 'approved').length },
      { Metric: 'Pending Visitors', Value: allData.visitors.filter(v => v.status === 'pending').length },
      { Metric: 'Active Passes', Value: allData.passes.filter(p => p.status === 'issued').length },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    XLSX.writeFile(workbook, `visitor_management_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '15px', color: '#666' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="stack">
      {/* Header with Export and Date Range */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>📊 Analytics Dashboard</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={exportAllDataToExcel}
              className="btn primary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              📊 Export Full Report
            </button>
            <label style={{ fontSize: '14px', color: '#666' }}>
              Date Range:
            </label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid">
        <div className="card stat-card">
          <div className="stat-card__label">👥 Total Visitors</div>
          <div className="stat-card__value">{summary.visitors}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">📅 Total Appointments</div>
          <div className="stat-card__value">{summary.appointments}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">🎫 Total Passes</div>
          <div className="stat-card__value">{summary.passes}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">✅ Active Passes</div>
          <div className="stat-card__value">
            {analytics.passesByStatus.find(p => p.name === 'Issued')?.value || 0}
          </div>
        </div>
      </div>

      {/* Charts Row 1 - Pie Charts */}
      <div className="grid">
        <div className="card">
          <h3>Visitors by Status</h3>
          {analytics.visitorsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.visitorsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.visitorsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No visitor data available</p>
          )}
        </div>

        <div className="card">
          <h3>Passes by Status</h3>
          {analytics.passesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.passesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.passesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No pass data available</p>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid">
        <div className="card">
          <h3>Appointments by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.appointmentsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4dabf7" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Check-ins/Outs Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.checkInsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Check-ins" stroke="#51cf66" strokeWidth={2} />
              <Line type="monotone" dataKey="Check-outs" stroke="#ff6b6b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Hosts */}
      {analytics.topHosts.length > 0 && (
        <div className="card">
          <h3>🏆 Top 5 Hosts by Appointments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topHosts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="#845ef7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <div className="card__header">
          <h3>🕒 Recent Activity</h3>
        </div>
        {summary.recentLogs?.length ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Visitor</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentLogs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{log.visitor?.fullName || 'Unknown'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: log.action === 'checkin' ? '#d4edda' : '#f8d7da',
                        color: log.action === 'checkin' ? '#155724' : '#721c24',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {log.action === 'checkin' ? '✅ Check-in' : '❌ Check-out'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>{log.location || 'N/A'}</td>
                    <td style={{ padding: '10px', fontSize: '13px', color: '#666' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;