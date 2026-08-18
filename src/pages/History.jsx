import React, { useState } from 'react';
import { fetchRequestById } from '../api';
import { Clock, Search, Loader2, AlertCircle } from 'lucide-react';

const History = () => {
  const [searchId, setSearchId] = useState('');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    
    setLoading(true);
    setError('');
    setRequest(null);
    
    try {
      const data = await fetchRequestById(searchId);
      setRequest(data);
    } catch (err) {
      setError(err.message || 'Request tidak ditemukan atau terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h2>Cek Status Request</h2>
      <p>Masukkan ID Request Anda untuk melihat detail dan status pengajuan.</p>

      <form onSubmit={handleSearch} style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', maxWidth: '500px' }}>
        <input 
          type="text" 
          placeholder="Contoh: 1691234567890" 
          value={searchId} 
          onChange={(e) => setSearchId(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Search />} Cari
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle /> {error}
        </div>
      )}

      {request && (
        <div className="glass-card" style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.7)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.25rem', color: 'var(--text-dark)' }}>{request.nama}</h3>
              <p style={{ margin: 0 }}>{request.perusahaan}{request.statusKerja ? ` (${request.statusKerja})` : ''} - {request.departement}</p>
            </div>
            <span className={`badge ${request.status === 'Approved' ? 'badge-green' : request.status === 'Rejected' ? 'badge-red' : 'badge-blue'}`} style={{ fontSize: '1rem' }}>
              {request.status || 'Pending'}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--primary-color)' }}>Visit Information</p>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                {new Date(request.arrivalDate).toLocaleDateString()} s/d {new Date(request.departureDate).toLocaleDateString()}
              </p>
              <p style={{ fontSize: '0.9rem' }}><strong>Tujuan:</strong> {request.purpose}</p>
            </div>
            
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--primary-color)' }}>Fasilitas</p>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>Transport:</strong> {request.transport?.airport ? 'Airport, ' : ''}{request.transport?.site ? 'Site, ' : ''}{request.transport?.returnTransport ? 'Return' : (!request.transport?.airport && !request.transport?.site ? '-' : '')}
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>Mess / Hotel:</strong> {request.needsMess ? 'Mess (Ya)' : request.needsHotel ? 'Hotel (Ya)' : 'Tidak Keduanya'}
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>Email:</strong> {request.email || '-'}
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                <strong>PPE:</strong> {request.safety?.shoes ? 'Shoes, ' : ''}{request.safety?.vest ? 'Vest, ' : ''}{request.safety?.helm ? 'Helm' : (!request.safety?.shoes && !request.safety?.vest ? '-' : '')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
