import { useEffect, useState } from 'react';
import api from '../../api/client';

const PassForm = ({ onIssued }) => {
  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({ 
    visitorId: '', 
    appointmentId: '',
    expiryDuration: 24 
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [visitorsRes, appointmentsRes] = await Promise.all([
          api.get('/visitors'),
          api.get('/appointments')
        ]);
        setVisitors(visitorsRes.data);
        setAppointments(appointmentsRes.data);
      } catch (error) {
        setStatus('Failed to load data');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Generating pass...');
    
    try {
      const { data } = await api.post('/passes', form);
      setStatus('✅ Pass issued successfully');
      setForm({ visitorId: '', appointmentId: '', expiryDuration: 24 });
      onIssued?.(data);
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ ' + (error.response?.data?.message || 'Error issuing pass'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card__header">
        <h3>Issue Pass</h3>
        {status && (
          <small style={{ 
            color: status.includes('✅') ? '#155724' : status.includes('❌') ? '#721c24' : '#856404' 
          }}>
            {status}
          </small>
        )}
      </div>
      
      {loadingData ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '10px', color: '#666' }}>Loading data...</p>
        </div>
      ) : (
        <>
          <div className="form-grid">
            <label>
              Visitor *
              <select 
                name="visitorId" 
                value={form.visitorId} 
                onChange={handleChange} 
                required
              >
                <option value="">Select visitor</option>
                {visitors.filter(v => v.status === 'approved').map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.fullName} {v.email ? `(${v.email})` : ''}
                  </option>
                ))}
              </select>
              <small style={{ fontSize: '11px', color: '#666' }}>
                ℹ️ Only approved visitors are shown
              </small>
            </label>
            
            <label>
              Appointment (optional)
              <select 
                name="appointmentId" 
                value={form.appointmentId} 
                onChange={handleChange}
              >
                <option value="">None</option>
                {appointments
                  .filter(a => a.status === 'approved')
                  .map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.visitor?.fullName} – {new Date(a.scheduleAt).toLocaleString()}
                    </option>
                  ))}
              </select>
              <small style={{ fontSize: '11px', color: '#666' }}>
                ℹ️ Only approved appointments are shown
              </small>
            </label>
            
            <label>
              Pass Validity (hours) *
              <input 
                type="number"
                name="expiryDuration" 
                value={form.expiryDuration} 
                onChange={handleChange}
                min="1"
                max="168"
                required
              />
              <small style={{ fontSize: '11px', color: '#666' }}>
                ℹ️ Pass will expire after this many hours (Max: 168 = 7 days)
              </small>
            </label>
          </div>
          
          <div style={{ 
            background: '#d1ecf1', 
            padding: '12px', 
            borderRadius: '8px',
            marginTop: '10px',
            fontSize: '13px',
            color: '#0c5460'
          }}>
            <strong>📅 Pass Expiration:</strong> Pass will be valid for {form.expiryDuration} hour(s) from issuance.
            <br />
            <strong>Expires at:</strong> {new Date(Date.now() + form.expiryDuration * 60 * 60 * 1000).toLocaleString()}
          </div>
          
          <button 
            className="btn primary" 
            type="submit"
            disabled={loading}
            style={{ 
              opacity: loading ? 0.6 : 1, 
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '15px'
            }}
          >
            {loading ? '⏳ Generating Pass...' : '🎫 Generate Pass'}
          </button>
        </>
      )}
    </form>
  );
};

export default PassForm;