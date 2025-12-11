import { useEffect, useState } from 'react';
import api from '../../api/client';

const AppointmentForm = ({ onCreated }) => {
  const [visitors, setVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(true);
  const [form, setForm] = useState({
    visitorId: '',
    hostName: '',
    hostEmail: '',
    hostDepartment: '',
    scheduleAt: '',
    notes: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVisitors = async () => {
      setLoadingVisitors(true);
      try {
        const { data } = await api.get('/visitors');
        setVisitors(data);
      } catch (error) {
        setStatus('Failed to load visitors');
      } finally {
        setLoadingVisitors(false);
      }
    };
    fetchVisitors();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Creating appointment...');
    
    try {
      const { data } = await api.post('/appointments', form);
      setStatus('✅ Appointment created and awaiting host approval');
      setForm({ visitorId: '', hostName: '', hostEmail: '', hostDepartment: '', scheduleAt: '', notes: '' });
      onCreated?.(data);
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ ' + (error.response?.data?.message || 'Error creating appointment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card__header">
        <h3>Schedule Appointment</h3>
        {status && (
          <small style={{ 
            color: status.includes('✅') ? '#155724' : status.includes('❌') ? '#721c24' : '#856404' 
          }}>
            {status}
          </small>
        )}
      </div>
      <div className="form-grid">
        <label>
          Visitor *
          <select 
            name="visitorId" 
            value={form.visitorId} 
            onChange={handleChange} 
            required
            disabled={loadingVisitors}
          >
            <option value="">
              {loadingVisitors ? 'Loading visitors...' : 'Select visitor'}
            </option>
            {visitors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.fullName} {v.email ? `(${v.email})` : ''}
              </option>
            ))}
          </select>
        </label>
        
        <label>
          Host Name *
          <input 
            name="hostName" 
            value={form.hostName} 
            onChange={handleChange} 
            required 
            placeholder="Jane Smith"
          />
        </label>
        
        <label>
          Host Email *
          <input 
            type="email"
            name="hostEmail" 
            value={form.hostEmail} 
            onChange={handleChange} 
            required
            placeholder="jane@company.com"
          />
          <small style={{ fontSize: '11px', color: '#666' }}>
            Host will receive approval notification
          </small>
        </label>
        
        <label>
          Department
          <input 
            name="hostDepartment" 
            value={form.hostDepartment} 
            onChange={handleChange}
            placeholder="Engineering"
          />
        </label>
        
        <label>
          Date & Time *
          <input 
            type="datetime-local" 
            name="scheduleAt" 
            value={form.scheduleAt} 
            onChange={handleChange} 
            required 
          />
        </label>
        
        <label>
          Notes
          <textarea 
            name="notes" 
            value={form.notes} 
            onChange={handleChange} 
            rows="3"
            placeholder="Any special instructions or notes..."
          />
        </label>
      </div>
      
      <button 
        className="btn primary" 
        type="submit"
        disabled={loading || loadingVisitors}
        style={{ 
          opacity: (loading || loadingVisitors) ? 0.6 : 1, 
          cursor: (loading || loadingVisitors) ? 'not-allowed' : 'pointer' 
        }}
      >
        {loading ? '⏳ Creating...' : 'Create Appointment'}
      </button>
    </form>
  );
};

export default AppointmentForm;