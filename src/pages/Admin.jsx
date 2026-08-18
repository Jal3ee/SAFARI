import React, { useState, useEffect } from 'react';
import { fetchRequests, updateRequestStatus } from '../api';
import { Loader2, Search, Lock, Download, Eye, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const DetailModal = ({ request, onClose, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(request.status);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateRequestStatus(request.id, status);
      onStatusUpdate(request.id, status);
    } catch (e) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', textAlign: 'left', maxHeight: '85vh', overflowY: 'auto', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)' }}>Detail Request: {request.id}</h2>
          <button onClick={onClose} style={{ background: 'var(--gray-light)', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem', fontSize: '1.05rem' }}>
          <div><strong style={{ color: 'var(--text-light)' }}>NIK:</strong><br/>{request.nik}</div>
          <div><strong style={{ color: 'var(--text-light)' }}>Karyawan AGM:</strong><br/>{request.isAGM ? 'Ya' : 'Tidak'}</div>
          <div><strong style={{ color: 'var(--text-light)' }}>Nama:</strong><br/>{request.nama}</div>
          <div><strong style={{ color: 'var(--text-light)' }}>Email:</strong><br/>{request.email || '-'}</div>
          <div><strong style={{ color: 'var(--text-light)' }}>Perusahaan:</strong><br/>{request.perusahaan}</div>
          <div><strong style={{ color: 'var(--text-light)' }}>Departemen:</strong><br/>{request.departement}</div>
          <div><strong style={{ color: 'var(--text-light)' }}>Arrival Date:</strong><br/>{new Date(request.arrivalDate).toLocaleDateString()}</div>
          <div><strong style={{ color: 'var(--text-light)' }}>Departure Date:</strong><br/>{new Date(request.departureDate).toLocaleDateString()}</div>
        </div>

        <div style={{ marginBottom: '2rem', fontSize: '1.05rem' }}>
          <strong style={{ color: 'var(--text-light)' }}>Tujuan:</strong>
          <p style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{request.purpose}</p>
        </div>

        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Transportasi</h4>
          {request.transport?.airport && <div>- Airport Pickup ({request.transport.airportNote || '-'})</div>}
          {request.transport?.site && <div>- Site Transport ({request.transport.siteNote || '-'})</div>}
          {request.transport?.returnTransport && <div>- Return Transport ({request.transport.returnNote || '-'})</div>}
          {!request.transport?.airport && !request.transport?.site && !request.transport?.returnTransport && <div>Tidak ada</div>}
        </div>

        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Safety (PPE)</h4>
          {request.safety?.shoes && <div>- Safety Shoes (Size: {request.safety.shoesSize || '-'})</div>}
          {request.safety?.vest && <div>- Safety Vest</div>}
          {request.safety?.helm && <div>- Safety Helmet</div>}
          {!request.safety?.shoes && !request.safety?.vest && !request.safety?.helm && <div>Tidak ada</div>}
        </div>

        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Akomodasi Mess / Hotel</h4>
          {request.needsMess ? (
            <>
              <div><strong>Kebutuhan Mess:</strong> Ya</div>
              <div>- Laundry: {request.messDetails?.laundry ? 'Ya' : 'Tidak'}</div>
              <div>- Meals: {request.messDetails?.meals ? 'Ya' : 'Tidak'}</div>
              <div>- Amenities: {request.messDetails?.amenities ? 'Ya' : 'Tidak'}</div>
            </>
          ) : request.needsHotel ? (
            <>
              <div><strong>Menginap di Hotel:</strong> Ya</div>
              {request.orderHotelHelp ? (
                <>
                  <div>- Minta tolong pesankan hotel: Ya</div>
                  <div>- Preferensi Nama: {request.hotelPreferenceName}</div>
                  <div>- Preferensi Lokasi: {request.hotelPreferenceLocation}</div>
                </>
              ) : (
                <>
                  <div>- Pesan hotel sendiri: Ya</div>
                  <div>- Nama Hotel: {request.hotelName}</div>
                  <div>- Lokasi: {request.hotelLocation}</div>
                </>
              )}
            </>
          ) : (
            <div>Tidak memerlukan mess maupun hotel</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <strong>Update Status:</strong>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ flex: 1, padding: '0.5rem' }}>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
            {updating ? 'Updating...' : 'Simpan Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
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

  const handleStatusUpdate = (id, newStatus) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
    setSelectedRequest(null);
  };

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
              <th>Action</th>
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
                    <span className={`badge ${req.status === 'Approved' ? 'badge-green' : req.status === 'Rejected' ? 'badge-red' : 'badge-blue'}`}>
                      {req.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => setSelectedRequest(req)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                      <Eye size={16} /> Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No requests found matching criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <DetailModal 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)} 
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default Admin;
