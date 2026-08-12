import React, { useState, useEffect } from 'react';
import { fetchRequests } from '../api';
import { Loader2, Search } from 'lucide-react';

const Admin = () => {
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
  }, []);

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
      <h2>All Requests (Admin Panel)</h2>
      <p>Manage and filter all SAFARI requests</p>
      
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
