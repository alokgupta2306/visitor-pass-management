import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PreRegister = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    host: '',
    purpose: '',
    appointmentDate: ''
  });
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) formData.append(k, v);
    });
    if (photo) formData.append('photo', photo);
    
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.post(`${baseUrl}/visitors/pre-register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('✅ Registration successful! Awaiting approval.');
      setSuccess(true);
    } catch (error) {
      setStatus('❌ ' + (error.response?.data?.message || 'Registration failed'));
    }
  };

  if (success) {
    return (
      <div className="card" style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
        <h2>✅ Pre-Registration Successful!</h2>
        <p>Thank you for registering. Your visit request is pending approval.</p>
        <p>You will receive an email notification once approved.</p>
        <Link to="/login" className="btn primary" style={{ marginTop: 20 }}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 600, margin: '20px auto' }}>
      <div className="card__header">
        <h2>Visitor Pre-Registration</h2>
        <small>{status}</small>
      </div>
      <form onSubmit={handleSubmit} className="stack">
        <div className="form-grid">
          <label>
            Full Name *
            <input 
              name="fullName" 
              value={form.fullName} 
              onChange={handleChange} 
              required 
              placeholder="John Doe"
            />
          </label>
          
          <label>
            Email *
            <input 
              type="email"
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              placeholder="john@example.com"
            />
          </label>
          
          <label>
            Phone *
            <input 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              required 
              placeholder="+1234567890"
            />
          </label>
          
          <label>
            Host/Person to Meet *
            <input 
              name="host" 
              value={form.host} 
              onChange={handleChange} 
              required 
              placeholder="Jane Smith"
            />
          </label>
          
          <label>
            Purpose of Visit *
            <input 
              name="purpose" 
              value={form.purpose} 
              onChange={handleChange} 
              required 
              placeholder="Business Meeting"
            />
          </label>
          
          <label>
            Appointment Date & Time
            <input 
              type="datetime-local"
              name="appointmentDate" 
              value={form.appointmentDate} 
              onChange={handleChange} 
            />
          </label>
          
          <label>
            Photo (optional)
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setPhoto(e.target.files[0])} 
            />
          </label>
        </div>
        
        <button type="submit" className="btn primary">
          Submit Pre-Registration
        </button>
        
        <div style={{ textAlign: 'center' }}>
          Already registered? <Link to="/login">Login here</Link>
        </div>
      </form>
    </div>
  );
};

export default PreRegister;