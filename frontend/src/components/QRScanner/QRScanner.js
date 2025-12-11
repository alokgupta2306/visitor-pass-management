import { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import api from '../../api/client';

const QRScanner = ({ onScan }) => {
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' | 'error' | 'info'
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState(null);

  useEffect(() => {
    // Suppress canvas warnings from QR library
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('willReadFrequently')) return;
      originalWarn(...args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  const handleResult = async (value) => {
    if (!value || !scanning) return;
    
    const text = value?.text || value;
    
    // Prevent duplicate scans within 3 seconds
    if (lastScanned === text) {
      return;
    }
    
    setLastScanned(text);
    setResult(text);
    setScanning(false); // Stop scanning while processing
    setStatus('Processing...');
    setStatusType('info');
    
    onScan?.(text);
    
    try {
      // Parse QR code data
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        setStatus('❌ Invalid QR code format');
        setStatusType('error');
        setTimeout(() => {
          setScanning(true);
          setStatus('');
          setLastScanned(null);
        }, 3000);
        return;
      }
      
      // Validate required fields
      if (!parsed.visitorId || !parsed.passId) {
        setStatus('❌ Invalid pass data - missing required information');
        setStatusType('error');
        setTimeout(() => {
          setScanning(true);
          setStatus('');
          setLastScanned(null);
        }, 3000);
        return;
      }
      
      // Verify pass is valid
      const verifyResponse = await api.post('/passes/verify', { passId: parsed.passId });
      
      if (!verifyResponse.data.valid) {
        setStatus('❌ Pass is not valid');
        setStatusType('error');
        setTimeout(() => {
          setScanning(true);
          setStatus('');
          setLastScanned(null);
        }, 3000);
        return;
      }
      
      // Log check-in/check-out
      await api.post('/check-logs', {
        visitorId: parsed.visitorId,
        passId: parsed.passId,
        action: parsed.action || 'checkin',
        location: parsed.location || 'frontdesk',
      });
      
      const visitor = verifyResponse.data.visitor;
      const actionText = parsed.action === 'checkout' ? 'checked out' : 'checked in';
      
      setStatus(`✅ ${visitor.fullName} ${actionText} successfully!`);
      setStatusType('success');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setScanning(true);
        setStatus('');
        setResult('');
        setLastScanned(null);
      }, 3000);
      
    } catch (error) {
      console.error('QR Scan error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to process QR code';
      setStatus(`❌ ${errorMsg}`);
      setStatusType('error');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setScanning(true);
        setStatus('');
        setLastScanned(null);
      }, 3000);
    }
  };

  const getStatusStyle = () => {
    const baseStyle = {
      padding: '12px',
      borderRadius: '8px',
      marginTop: '10px',
      fontWeight: '600',
      textAlign: 'center'
    };

    if (statusType === 'success') {
      return { ...baseStyle, background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
    } else if (statusType === 'error') {
      return { ...baseStyle, background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
    } else if (statusType === 'info') {
      return { ...baseStyle, background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' };
    }
    return baseStyle;
  };

  return (
    <div className="card">
      <div className="card__header">
        <h3>🔍 Scan Visitor QR Code</h3>
      </div>
      
      {status && (
        <div style={getStatusStyle()}>
          {status}
        </div>
      )}
      
      <div style={{ width: '100%', marginTop: '15px', position: 'relative' }}>
        {scanning ? (
          <>
            <QrReader
              onResult={(value, error) => {
                if (value) handleResult(value);
                if (error) console.debug(error);
              }}
              constraints={{ facingMode: 'environment' }}
              style={{ width: '100%' }}
            />
            <div style={{ 
              textAlign: 'center', 
              marginTop: '10px', 
              color: '#666',
              fontSize: '14px'
            }}>
              📱 Point camera at QR code
            </div>
          </>
        ) : (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '15px', color: '#666' }}>Processing...</p>
          </div>
        )}
      </div>
      
      {result && (
        <details style={{ marginTop: '15px', fontSize: '12px' }}>
          <summary style={{ cursor: 'pointer', color: '#666' }}>View Raw QR Data</summary>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '5px',
            overflow: 'auto',
            marginTop: '10px'
          }}>
            {result}
          </pre>
        </details>
      )}
    </div>
  );
};

export default QRScanner;