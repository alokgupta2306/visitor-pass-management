import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      setStatus('Logged in');
      navigate('/');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '20px auto' }}>
      <div className="card__header">
        <h3>Login</h3>
        <small>{status}</small>
      </div>
      <form onSubmit={handleSubmit} className="stack">
        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button className="btn primary" type="submit">
          Login
        </button>
        <div style={{ textAlign: 'center' }}>
          No account? <Link to="/register">Register</Link>
          <br />
          <small>Visiting? <Link to="/pre-register">Pre-register your visit</Link></small>
        </div>
      </form>
    </div>
  );
};

export default Login;