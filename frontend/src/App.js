import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import VisitorForm from './components/Visitor/VisitorForm';
import VisitorDetails from './components/Visitor/VisitorDetails';
import AppointmentForm from './components/Appointment/AppointmentForm';
import AppointmentDetails from './components/Appointment/AppointmentDetails';
import PassForm from './components/Pass/PassForm';
import PassCard from './components/Pass/PassCard';
import QRScanner from './components/QRScanner/QRScanner';
import Dashboard from './pages/Dashboard';
import api from './api/client';
import Login from './pages/Login';
import Register from './pages/Register';
import PreRegister from './pages/PreRegister';
import UserManagement from './pages/UserManagement';
import * as XLSX from 'xlsx';

function AppContent() {
  const { token, user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [v, a, p] = await Promise.all([
        api.get('/visitors'),
        api.get('/appointments'),
        api.get('/passes'),
      ]);
      setVisitors(v.data || []);
      setAppointments(a.data || []);
      setPasses(p.data || []);
    } catch (error) {
      console.warn('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  // Export functions
  const exportVisitorsToExcel = () => {
    const data = visitors.map(v => ({
      'Full Name': v.fullName,
      'Email': v.email || 'N/A',
      'Phone': v.phone || 'N/A',
      'Host': v.host || 'N/A',
      'Purpose': v.purpose || 'N/A',
      'Status': v.status,
      'Created At': new Date(v.createdAt).toLocaleString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitors');
    XLSX.writeFile(workbook, `visitors_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportAppointmentsToExcel = () => {
    const data = appointments.map(a => ({
      'Visitor': a.visitor?.fullName || 'N/A',
      'Host Name': a.hostName,
      'Department': a.hostDepartment || 'N/A',
      'Scheduled At': new Date(a.scheduleAt).toLocaleString(),
      'Status': a.status,
      'Notes': a.notes || 'N/A',
      'Created At': new Date(a.createdAt).toLocaleString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
    XLSX.writeFile(workbook, `appointments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPassesToExcel = () => {
    const data = passes.map(p => ({
      'Visitor': p.visitor?.fullName || 'N/A',
      'Status': p.status,
      'Issued At': new Date(p.createdAt).toLocaleString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Passes');
    XLSX.writeFile(workbook, `passes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Show login page if no token
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pre-register" element={<PreRegister />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container">
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '15px', color: '#666' }}>Loading data...</p>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
          <Route
            path="/visitors"
            element={
              <div className="stack">
                <VisitorForm onCreated={loadData} />
                
                {/* Search Bar with Export */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>👥 Visitors List</h3>
                    <button
                      onClick={exportVisitorsToExcel}
                      className="btn primary"
                      style={{ fontSize: '13px', padding: '8px 16px' }}
                    >
                      📥 Export to Excel
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="🔍 Search visitors by name, email, or phone..."
                    onChange={(e) => {
                      const term = e.target.value;
                      if (term) {
                        api.get(`/visitors?search=${term}`)
                          .then(({ data }) => setVisitors(data))
                          .catch(() => {});
                      } else {
                        loadData();
                      }
                    }}
                    style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                  />
                </div>
                
                <div className="grid">
                  {visitors.map((v) => (
                    <VisitorDetails key={v._id} visitor={v} />
                  ))}
                </div>
              </div>
            }
          />
          
          <Route
            path="/appointments"
            element={
              <div className="stack">
                <AppointmentForm onCreated={loadData} />
                
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>📅 Appointments</h3>
                    <button
                      onClick={exportAppointmentsToExcel}
                      className="btn primary"
                      style={{ fontSize: '13px', padding: '8px 16px' }}
                    >
                      📥 Export to Excel
                    </button>
                  </div>
                </div>
                
                <div className="grid">
                  {appointments.map((a) => (
                    <AppointmentDetails key={a._id} appointment={a} />
                  ))}
                </div>
              </div>
            }
          />
          
          <Route
            path="/users"
            element={
              user?.role === 'admin' ? (
                <UserManagement />
              ) : (
                <Navigate to="/visitors" replace />
              )
            }
          />
          
          <Route
            path="/passes"
            element={
              <div className="stack">
                <PassForm onIssued={loadData} />
                
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>🎫 Passes</h3>
                    <button
                      onClick={exportPassesToExcel}
                      className="btn primary"
                      style={{ fontSize: '13px', padding: '8px 16px' }}
                    >
                      📥 Export to Excel
                    </button>
                  </div>
                </div>
                
                <div className="grid">
                  {passes.map((p) => (
                    <PassCard key={p._id} pass={p} />
                  ))}
                </div>
              </div>
            }
          />
          
          <Route path="/scanner" element={<QRScanner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default AppContent;