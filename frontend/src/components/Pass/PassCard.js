const PassCard = ({ pass }) => {
  if (!pass) return null;

  const base = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
  
  // Calculate time remaining
  const now = new Date();
  const validUntil = new Date(pass.validUntil);
  const hoursRemaining = Math.max(0, Math.floor((validUntil - now) / (1000 * 60 * 60)));
  const isExpiringSoon = hoursRemaining <= 3 && hoursRemaining > 0;
  const isExpired = pass.status === 'expired' || validUntil < now;

  return (
    <div className="card">
      <div className="card__header">
        <h4>{pass.visitor?.fullName || 'Visitor'}</h4>
        <span className={`badge status-${pass.status}`}>{pass.status}</span>
      </div>
      
      <p><strong>Issued:</strong> {new Date(pass.createdAt).toLocaleString()}</p>
      <p><strong>Valid From:</strong> {new Date(pass.validFrom).toLocaleString()}</p>
      <p><strong>Valid Until:</strong> {new Date(pass.validUntil).toLocaleString()}</p>
      
      {!isExpired && (
        <div style={{ 
          background: isExpiringSoon ? '#fff3cd' : '#d4edda', 
          padding: '10px', 
          borderRadius: '6px',
          marginTop: '10px',
          fontSize: '13px',
          color: isExpiringSoon ? '#856404' : '#155724'
        }}>
          {isExpiringSoon ? '⚠️' : '✅'} {hoursRemaining} hour(s) remaining
        </div>
      )}
      
      {isExpired && (
        <div style={{ 
          background: '#f8d7da', 
          padding: '10px', 
          borderRadius: '6px',
          marginTop: '10px',
          fontSize: '13px',
          color: '#721c24'
        }}>
          ❌ This pass has expired
        </div>
      )}
      
      {pass.pdfPath && (
        <a 
          href={pass.pdfPath.startsWith('http') ? pass.pdfPath : `${base}${pass.pdfPath}`} 
          target="_blank" 
          rel="noreferrer" 
          className="btn ghost"
          style={{ marginTop: '12px' }}
        >
          📄 View PDF Pass
        </a>
      )}
    </div>
  );
};

export default PassCard;