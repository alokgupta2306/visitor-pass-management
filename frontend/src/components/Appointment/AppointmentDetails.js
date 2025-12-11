import { useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const AppointmentDetails = ({ appointment, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declinedReason, setDeclinedReason] = useState('');

  if (!appointment) return null;

  const canApprove = user && (user.role === 'admin' || user.role === 'employee');
  const isPending = appointment.status === 'scheduled';

  const handleApprove = async () => {
    if (!window.confirm('Approve this appointment?')) return;
    
    setLoading(true);
    try {
      const { data } = await api.patch(`/appointments/${appointment._id}/status`, {
        status: 'approved'
      });
      alert('✅ Appointment approved successfully!');
      onUpdate?.(data);
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to approve'));
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!declinedReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.patch(`/appointments/${appointment._id}/status`, {
        status: 'declined',
        declinedReason
      });
      alert('Appointment declined');
      setShowDeclineForm(false);
      setDeclinedReason('');
      onUpdate?.(data);
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to decline'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card__header">
        <h4>{appointment.visitor?.fullName || 'Visitor'}</h4>
        <span className={`badge status-${appointment.status}`}>{appointment.status}</span>
      </div>
      <p><strong>Host:</strong> {appointment.hostName}</p>
      {appointment.hostEmail && <p><strong>Host Email:</strong> {appointment.hostEmail}</p>}
      {appointment.hostDepartment && <p><strong>Department:</strong> {appointment.hostDepartment}</p>}
      <p><strong>Scheduled:</strong> {new Date(appointment.scheduleAt).toLocaleString()}</p>
      {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
      {appointment.declinedReason && (
        <p style={{ color: '#721c24' }}>
          <strong>Decline Reason:</strong> {appointment.declinedReason}
        </p>
      )}
      {appointment.approvedBy && (
        <p style={{ fontSize: '12px', color: '#666' }}>
          Approved by: {appointment.approvedBy.name} on {new Date(appointment.approvedAt).toLocaleString()}
        </p>
      )}
      
      {canApprove && isPending && !showDeclineForm && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            className="btn primary" 
            onClick={handleApprove}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? '⏳ Processing...' : '✅ Approve'}
          </button>
          <button 
            className="btn danger" 
            onClick={() => setShowDeclineForm(true)}
            disabled={loading}
            style={{ flex: 1, background: '#dc3545' }}
          >
            ❌ Decline
          </button>
        </div>
      )}
      
      {showDeclineForm && (
        <div style={{ marginTop: '15px', padding: '15px', background: '#f8d7da', borderRadius: '8px' }}>
          <label>
            <strong>Reason for declining:</strong>
            <textarea
              value={declinedReason}
              onChange={(e) => setDeclinedReason(e.target.value)}
              rows="3"
              placeholder="Please provide a reason..."
              style={{ width: '100%', marginTop: '8px' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              className="btn danger" 
              onClick={handleDecline}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : 'Confirm Decline'}
            </button>
            <button 
              className="btn ghost" 
              onClick={() => {
                setShowDeclineForm(false);
                setDeclinedReason('');
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;