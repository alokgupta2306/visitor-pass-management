import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [status, setStatus] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      setStatus('Account created');
      navigate('/');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '20px auto' }}>
      <div className="card__header">
        <h3>Register</h3>
        <small>{status}</small>
      </div>
      <form onSubmit={handleSubmit} className="stack">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required minLength="6" />
        </label>
        {/* REMOVED: Role selection - users can only register as employee */}
        <small style={{ color: '#666', fontSize: '12px' }}>
          ℹ️ New accounts are created as Employee by default. Contact admin for role changes.
        </small>
        <button className="btn primary" type="submit">
          Register
        </button>
        <div>
          Have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;