const VisitorDetails = ({ visitor }) => {
  if (!visitor) return null;

  const base = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div className="card visitor-card">
      <div className="card__header">
        <h4>{visitor.fullName}</h4>
        <span className={`badge status-${visitor.status}`}>{visitor.status}</span>
      </div>
      {visitor.photo && (
        <img
          src={`${base}${visitor.photo}`}
          alt={visitor.fullName}
          style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 180 }}
        />
      )}
      <p>{visitor.email}</p>
      <p>{visitor.phone}</p>
      <p>Host: {visitor.host || '—'}</p>
      <p>Purpose: {visitor.purpose || '—'}</p>
    </div>
  );
};

export default VisitorDetails;


