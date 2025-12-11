import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role badge colors
  const getRoleBadgeStyle = (role) => {
    const styles = {
      admin: { background: '#ff6b6b', color: 'white' },
      security: { background: '#4dabf7', color: 'white' },
      employee: { background: '#51cf66', color: 'white' },
      visitor: { background: '#ffd43b', color: '#333' },
    };
    return styles[role] || styles.employee;
  };

  return (
    <nav className="nav">
      <div className="nav__brand">🎫 Visitor Pass System</div>
      <div className="nav__links">
        {token ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/visitors">Visitors</Link>
            <Link to="/appointments">Appointments</Link>
            <Link to="/passes">Passes</Link>
            <Link to="/scanner">QR Scanner</Link>
            {user?.role === 'admin' && <Link to="/users">User Management</Link>}
            
            {/* User Info Display */}
            {user && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginLeft: '20px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                  👤 {user.name}
                </span>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    ...getRoleBadgeStyle(user.role)
                  }}
                >
                  {user.role}
                </span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="btn ghost"
              style={{ marginLeft: '10px' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;