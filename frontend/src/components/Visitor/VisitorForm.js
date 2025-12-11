import { useState } from 'react';
import api from '../../api/client';

const initialState = { fullName: '', email: '', phone: '', host: '', purpose: '' };

const VisitorForm = ({ onCreated }) => {
  const [form, setForm] = useState(initialState);
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  };

  const validateFile = (file) => {
    if (!file) return { valid: true };
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Only JPEG, PNG, and GIF images are allowed' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, message: 'File size must be less than 5MB' };
    }
    
    return { valid: true };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (form.email && !validateEmail(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (form.phone && !validatePhone(form.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (photo) {
      const fileValidation = validateFile(photo);
      if (!fileValidation.valid) {
        newErrors.photo = fileValidation.message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    
    // Validate file immediately
    if (file) {
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        setErrors({ ...errors, photo: fileValidation.message });
      } else {
        setErrors({ ...errors, photo: '' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setStatus('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    setStatus('Saving...');
    
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) formData.append(k, v.trim());
    });
    if (photo) formData.append('photo', photo);
    
    try {
      const { data } = await api.post('/visitors', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setStatus('✅ Visitor created successfully');
      setForm(initialState);
      setPhoto(null);
      setErrors({});
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      onCreated?.(data);
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ ' + (error.response?.data?.message || 'Error creating visitor'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card__header">
        <h3>Register Visitor</h3>
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
          Full Name *
          <input 
            name="fullName" 
            value={form.fullName} 
            onChange={handleChange} 
            required 
            placeholder="John Doe"
            style={{ borderColor: errors.fullName ? '#dc3545' : undefined }}
          />
          {errors.fullName && (
            <small style={{ color: '#dc3545', fontSize: '12px' }}>{errors.fullName}</small>
          )}
        </label>
        
        <label>
          Email
          <input 
            name="email" 
            type="email"
            value={form.email} 
            onChange={handleChange} 
            placeholder="john@example.com"
            style={{ borderColor: errors.email ? '#dc3545' : undefined }}
          />
          {errors.email && (
            <small style={{ color: '#dc3545', fontSize: '12px' }}>{errors.email}</small>
          )}
        </label>
        
        <label>
          Phone
          <input 
            name="phone" 
            value={form.phone} 
            onChange={handleChange} 
            placeholder="+1234567890"
            style={{ borderColor: errors.phone ? '#dc3545' : undefined }}
          />
          {errors.phone && (
            <small style={{ color: '#dc3545', fontSize: '12px' }}>{errors.phone}</small>
          )}
        </label>
        
        <label>
          Host
          <input 
            name="host" 
            value={form.host} 
            onChange={handleChange} 
            placeholder="Jane Smith"
          />
        </label>
        
        <label>
          Purpose
          <input 
            name="purpose" 
            value={form.purpose} 
            onChange={handleChange} 
            placeholder="Business Meeting"
          />
        </label>
        
        <label>
          Photo (Max 5MB, JPEG/PNG/GIF)
          <input 
            type="file" 
            accept="image/jpeg,image/jpg,image/png,image/gif" 
            onChange={handleFileChange}
            style={{ borderColor: errors.photo ? '#dc3545' : undefined }}
          />
          {errors.photo && (
            <small style={{ color: '#dc3545', fontSize: '12px' }}>{errors.photo}</small>
          )}
          {photo && !errors.photo && (
            <small style={{ color: '#28a745', fontSize: '12px' }}>
              ✓ {photo.name} ({(photo.size / 1024).toFixed(2)} KB)
            </small>
          )}
        </label>
      </div>
      
      <button 
        type="submit" 
        className="btn primary" 
        disabled={loading}
        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? '⏳ Saving...' : 'Save Visitor'}
      </button>
    </form>
  );
};

export default VisitorForm;