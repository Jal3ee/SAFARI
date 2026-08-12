import React, { useState, useEffect } from 'react';
import { fetchRequests } from '../api';
import { Loader2, Search, Lock, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const Admin = () => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state (one for each column)
  const [filters, setFilters] = useState({
    nama: '',
    perusahaan: '',
    departement: '',
    arrivalDate: '',
    status: ''
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (isAuthenticated) {
      const loadRequests = async () => {
        try {
          const data = await fetchRequests();
          setRequests(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } catch (error) {
          console.error('Failed to load history', error);
        } finally {
          setLoading(false);
        }
      };
      loadRequests();
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isAuthenticated]);

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredRequests = requests.filter(req => {
    return (
      req.nama?.toLowerCase().includes(filters.nama.toLowerCase()) &&
      req.perusahaan?.toLowerCase().includes(filters.perusahaan.toLowerCase()) &&
      req.departement?.toLowerCase().includes(filters.departement.toLowerCase()) &&
      req.status?.toLowerCase().includes(filters.status.toLowerCase()) &&
      (filters.arrivalDate === '' || req.arrivalDate?.includes(filters.arrivalDate))
    );
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'admin123') { // Simple passcode
      setIsAuthenticated(true);
    } else {
      alert('Passcode salah!');
    }
  };

  const handleExportExcel = () => {
    const excelData = filteredRequests.map(req => ({
      'ID Request': req.id,
      'Status': req.status,
      'Karyawan AGM': req.isAGM ? 'Ya' : 'Tidak',
      'NIK': req.nik,
      'Nama': req.nama,
      'Perusahaan': req.perusahaan,
      'Departemen': req.departement,
      'Tgl Datang': req.arrivalDate,
      'Tgl Pulang': req.departureDate,
      'Tujuan': req.purpose,
      'Airport Pickup': req.transport?.airport ? 'Ya' : 'Tidak',
      'Site Transport': req.transport?.site ? 'Ya' : 'Tidak',
      'Return Transport': req.transport?.returnTransport ? 'Ya' : 'Tidak',
      'Butuh Mess': req.needsMess ? 'Ya' : 'Tidak'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
    
    XLSX.writeFile(workbook, "Data_SAFARI.xlsx");
  };

  if (isMobile) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Akses Ditolak</h2>
        <p>Panel Admin hanya dapat diakses melalui perangkat Desktop / Laptop.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="glass-card" style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="modal-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
          <Lock size={32} />
        </div>
        <h2>Admin Login</h2>
        <p>Masukkan passcode untuk masuk ke Panel Admin.</p>
        <form onSubmit={handleLogin} style={{ marginTop: '1.5rem' }}>
          <input 
            type="password" 
            placeholder="Passcode" 
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            style={{ marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.2rem' }}
          />
          <button type="submit" className="btn btn-primary btn-full">Login</button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary-color)', margin: '0 auto' }} />
        <p style={{ marginTop: '1rem' }}>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>All Requests (Admin Panel)</h2>
          <p style={{ margin: 0 }}>Manage and filter all SAFARI requests</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} /> Export Excel
        </button>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>
                Name
                <div style={{ marginTop: '0.5rem' }}>
                  <input type="text" placeholder="Search..." value={filters.nama} onChange={(e) => handleFilterChange('nama', e.target.value)} style={{ padding: '0.25rem', fontSize: '0.85rem' }} />
                </div>
              </th>
              <th>
                Company
                <div style={{ marginTop: '0.5rem' }}>
                  <input type="text" placeholder="Search..." value={filters.perusahaan} onChange={(e) => handleFilterChange('perusahaan', e.target.value)} style={{ padding: '0.25rem', fontSize: '0.85rem' }} />
                </div>
              </th>
              <th>
                Department
                <div style={{ marginTop: '0.5rem' }}>
                  <input type="text" placeholder="Search..." value={filters.departement} onChange={(e) => handleFilterChange('departement', e.target.value)} style={{ padding: '0.25rem', fontSize: '0.85rem' }} />
                </div>
              </th>
              <th>
                Arrival Date
                <div style={{ marginTop: '0.5rem' }}>
                  <input type="date" value={filters.arrivalDate} onChange={(e) => handleFilterChange('arrivalDate', e.target.value)} style={{ padding: '0.25rem', fontSize: '0.85rem' }} />
                </div>
              </th>
              <th>Transport</th>
              <th>Mess</th>
              <th>
                Status
                <div style={{ marginTop: '0.5rem' }}>
                  <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={{ padding: '0.25rem', fontSize: '0.85rem' }}>
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(req => (
                <tr key={req.id}>
                  <td>
                    {req.nama} <br/>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>NIK: {req.nik}</span>
                  </td>
                  <td>{req.perusahaan}</td>
                  <td>{req.departement}</td>
                  <td>{req.arrivalDate}</td>
                  <td>
                    {req.transport?.airport && <div className="badge badge-blue" style={{display: 'inline-block', marginBottom:'2px'}}>Airport</div>}
                    {req.transport?.site && <div className="badge badge-blue" style={{display: 'inline-block', marginBottom:'2px'}}>Site</div>}
                    {req.transport?.returnTransport && <div className="badge badge-blue" style={{display: 'inline-block'}}>Return</div>}
                    {!req.transport?.airport && !req.transport?.site && !req.transport?.returnTransport && '-'}
                  </td>
                  <td>
                    {req.needsMess ? 'Yes' : 'No'}
                  </td>
                  <td>
                    <span className={`badge ${req.status === 'Approved' ? 'badge-green' : 'badge-blue'}`}>
                      {req.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No requests found matching criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
