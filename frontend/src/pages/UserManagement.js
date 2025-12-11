import { useState, useEffect } from 'react';
import api from '../api/client';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      setStatus('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        setStatus('User updated successfully');
      } else {
        await api.post('/users', form);
        setStatus('User created successfully');
      }
      setForm({ name: '', email: '', password: '', role: 'employee' });
      setEditingId(null);
      loadUsers();
    } catch (error) {
      setStatus(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setStatus('User deleted successfully');
      loadUsers();
    } catch (error) {
      setStatus(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="card__header">
          <h2>User Management</h2>
          {status && <small>{status}</small>}
        </div>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="John Doe"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="john@example.com"
            />
          </label>
          <label>
            Password {editingId && '(leave blank to keep current)'}
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingId}
              minLength="6"
              placeholder={editingId ? 'Leave blank to keep current' : 'Minimum 6 characters'}
            />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="employee">Employee</option>
              <option value="security">Security</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn primary">
              {editingId ? 'Update User' : 'Create User'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', email: '', password: '', role: 'employee' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>All Users</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{user.name}</td>
                  <td style={{ padding: '10px' }}>{user.email}</td>
                  <td style={{ padding: '10px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background:
                          user.role === 'admin'
                            ? '#ff6b6b'
                            : user.role === 'security'
                            ? '#4dabf7'
                            : '#51cf66',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button className="btn ghost" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                    <button
                      className="btn ghost"
                      onClick={() => handleDelete(user._id)}
                      style={{ marginLeft: '10px', color: '#ff6b6b' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;