import React, { useState, useEffect } from 'react';
import { Save, Loader2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { saveRequest, verifyNIK } from '../api';
import { useNavigate } from 'react-router-dom';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
      {message}
    </div>
  );
};

const SuccessModal = ({ requestId, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-icon">
        <CheckCircle size={32} />
      </div>
      <h2>Request Terkirim!</h2>
      <p>Data Anda berhasil disimpan. Harap catat ID Request Anda untuk mengecek status di halaman History:</p>
      <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--primary-color)', margin: '1.5rem 0' }}>
        {requestId}
      </div>
      <button className="btn btn-primary btn-full" onClick={onClose}>Lihat History</button>
    </div>
  </div>
);

const NewRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingNIK, setCheckingNIK] = useState(false);
  
  // Toast & Modal state
  const [toast, setToast] = useState(null); // { message, type }
  const [successId, setSuccessId] = useState(null);
  
  // Form State
  const [isAGM, setIsAGM] = useState(null);
  const [nik, setNik] = useState('');
  
  // Data Diri
  const [nama, setNama] = useState('');
  const [perusahaan, setPerusahaan] = useState('');
  const [departement, setDepartement] = useState('');
  
  // Visit Info
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [purpose, setPurpose] = useState('');
  
  // Transport
  const [transport, setTransport] = useState({
    airport: false, airportNote: '',
    site: false, siteNote: '',
    returnTransport: false, returnNote: ''
  });
  
  // Safety
  const [safety, setSafety] = useState({
    shoes: false, shoesSize: '',
    vest: false,
    helm: false
  });
  
  // Akomodasi
  const [needsMess, setNeedsMess] = useState(null);
  const [messDetails, setMessDetails] = useState({
    laundry: null,
    meals: null,
    amenities: null
  });

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const handleVerifyNIK = async () => {
    if (!nik) {
      showToast('Harap masukkan NIK terlebih dahulu');
      return;
    }
    setCheckingNIK(true);
    try {
      const res = await verifyNIK(nik);
      if (res.success) {
        setNama(res.data.nama);
        setPerusahaan(res.data.perusahaan);
        setDepartement(res.data.departement);
        showToast('Data Karyawan ditemukan', 'success');
      } else {
        showToast(res.message || 'NIK tidak ditemukan');
        setNama(''); setPerusahaan(''); setDepartement('');
      }
    } catch (err) {
      showToast('Gagal memverifikasi NIK. Pastikan GAS URL sudah benar.');
    } finally {
      setCheckingNIK(false);
    }
  };

  const validateForm = () => {
    if (isAGM === null) return "Harap pilih apakah Anda Karyawan AGM";
    if (isAGM && !nik) return "Harap masukkan NIK";
    if (!nama || !perusahaan || !departement) return "Harap lengkapi Data Diri";
    if (!arrivalDate || !departureDate || !purpose) return "Harap lengkapi Visit Information";
    if (needsMess === null) return "Harap pilih apakah memerlukan Mess";
    if (needsMess) {
      if (messDetails.laundry === null || messDetails.meals === null || messDetails.amenities === null) {
        return "Harap lengkapi opsi Kebutuhan Fasilitas Mess";
      }
    }
    if (safety.shoes && !safety.shoesSize) return "Harap masukkan ukuran Safety Shoes";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errorMsg = validateForm();
    if (errorMsg) {
      showToast(errorMsg);
      return;
    }

    setLoading(true);
    
    const payload = {
      isAGM,
      nik: isAGM ? nik : '-',
      nama,
      perusahaan,
      departement,
      arrivalDate,
      departureDate,
      purpose,
      transport,
      safety,
      needsMess,
      messDetails: needsMess ? messDetails : null
    };

    try {
      const res = await saveRequest(payload);
      if (res.status === 'success') {
        setSuccessId(res.id);
      } else {
        showToast('Gagal menyimpan: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h2>New SAFARI Request</h2>
      <p>Site Access, Facility & Arrival Request Integration</p>
      
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {successId && (
        <SuccessModal requestId={successId} onClose={() => {
          setSuccessId(null);
          navigate('/history');
        }} />
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        
        {/* Section 1: Identitas */}
        <div className="glass-card" style={{ background: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.9)' }}>
          <h3>1. Informasi Identitas</h3>
          <div className="form-group">
            <label>Apakah Anda Karyawan AGM?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="isAGM" checked={isAGM === true} onChange={() => { setIsAGM(true); setNama(''); setPerusahaan(''); setDepartement(''); }} /> Yes
              </label>
              <label className="radio-label">
                <input type="radio" name="isAGM" checked={isAGM === false} onChange={() => { setIsAGM(false); setNik(''); setNama(''); setPerusahaan(''); setDepartement(''); }} /> No
              </label>
            </div>
          </div>

          {isAGM === true && (
            <div className="form-group">
              <label>NIK</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  value={nik} 
                  onChange={(e) => setNik(e.target.value)} 
                  placeholder="Masukkan NIK" 
                />
                <button type="button" className="btn btn-secondary" onClick={handleVerifyNIK} disabled={checkingNIK}>
                  {checkingNIK ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} Generate
                </button>
              </div>
            </div>
          )}

          {(isAGM !== null) && (
            <>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} readOnly={isAGM} placeholder="Masukkan Nama Lengkap" />
              </div>
              <div className="form-group">
                <label>Perusahaan</label>
                <input type="text" value={perusahaan} onChange={(e) => setPerusahaan(e.target.value)} readOnly={isAGM} placeholder="Masukkan Nama Perusahaan" />
              </div>
              <div className="form-group">
                <label>Departement</label>
                <input type="text" value={departement} onChange={(e) => setDepartement(e.target.value)} readOnly={isAGM} placeholder="Masukkan Nama Departement" />
              </div>
            </>
          )}
        </div>

        {/* Section 2: Visit Information */}
        <div className="glass-card" style={{ background: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.9)' }}>
          <h3>2. Visit Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Arrival Date</label>
              <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Departure Date</label>
              <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Purpose of Visit</label>
            <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows="3" placeholder="Jelaskan tujuan kunjungan Anda"></textarea>
          </div>
        </div>

        {/* Section 3: Transport */}
        <div className="glass-card" style={{ background: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.9)' }}>
          <h3>3. Transport (Opsional)</h3>
          <p style={{ fontSize: '0.9rem' }}>Pilih opsi transportasi jika dibutuhkan.</p>
          
          <div className="checkbox-card">
            <label className="checkbox-header">
              <input type="checkbox" checked={transport.airport} onChange={(e) => setTransport({...transport, airport: e.target.checked})} />
              <span style={{ fontWeight: 600 }}>Airport Pickup</span>
            </label>
            {transport.airport && (
              <div className="checkbox-body">
                <input type="text" placeholder="Optional note (e.g. Flight GA123, 10:00 AM)" value={transport.airportNote} onChange={(e) => setTransport({...transport, airportNote: e.target.value})} />
              </div>
            )}
          </div>

          <div className="checkbox-card">
            <label className="checkbox-header">
              <input type="checkbox" checked={transport.site} onChange={(e) => setTransport({...transport, site: e.target.checked})} />
              <span style={{ fontWeight: 600 }}>Site Transport</span>
            </label>
            {transport.site && (
              <div className="checkbox-body">
                <input type="text" placeholder="Optional note (e.g. Unit hilux)" value={transport.siteNote} onChange={(e) => setTransport({...transport, siteNote: e.target.value})} />
              </div>
            )}
          </div>

          <div className="checkbox-card">
            <label className="checkbox-header">
              <input type="checkbox" checked={transport.returnTransport} onChange={(e) => setTransport({...transport, returnTransport: e.target.checked})} />
              <span style={{ fontWeight: 600 }}>Return Transport</span>
            </label>
            {transport.returnTransport && (
              <div className="checkbox-body">
                <input type="text" placeholder="Optional note" value={transport.returnNote} onChange={(e) => setTransport({...transport, returnNote: e.target.value})} />
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Safety */}
        <div className="glass-card" style={{ background: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.9)' }}>
          <h3>4. Personal Protective Equipment (PPE)</h3>
          <p style={{ fontSize: '0.9rem' }}>Centang APD yang diperlukan (Opsional).</p>
          
          <div className="checkbox-card">
            <label className="checkbox-header">
              <input type="checkbox" checked={safety.shoes} onChange={(e) => setSafety({...safety, shoes: e.target.checked})} />
              <span style={{ fontWeight: 600 }}>Safety Shoes</span>
            </label>
            {safety.shoes && (
              <div className="checkbox-body">
                <input type="number" placeholder="Ukuran Sepatu (Size)" value={safety.shoesSize} onChange={(e) => setSafety({...safety, shoesSize: e.target.value})} />
              </div>
            )}
          </div>
          <div className="checkbox-card">
            <label className="checkbox-header">
              <input type="checkbox" checked={safety.vest} onChange={(e) => setSafety({...safety, vest: e.target.checked})} />
              <span style={{ fontWeight: 600 }}>Safety Vest</span>
            </label>
          </div>
          <div className="checkbox-card">
            <label className="checkbox-header">
              <input type="checkbox" checked={safety.helm} onChange={(e) => setSafety({...safety, helm: e.target.checked})} />
              <span style={{ fontWeight: 600 }}>Safety Helmet</span>
            </label>
          </div>
        </div>

        {/* Section 5: Akomodasi */}
        <div className="glass-card" style={{ background: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.9)' }}>
          <h3>5. Kebutuhan Fasilitas Mess</h3>
          <div className="form-group">
            <label>Apakah Anda memerlukan Mess?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="needsMess" checked={needsMess === true} onChange={() => setNeedsMess(true)} /> Yes
              </label>
              <label className="radio-label">
                <input type="radio" name="needsMess" checked={needsMess === false} onChange={() => setNeedsMess(false)} /> No
              </label>
            </div>
          </div>

          {needsMess === true && (
            <div style={{ paddingLeft: '1.5rem', borderLeft: '4px solid var(--primary-color)', marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Laundry Services</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="laundry" checked={messDetails.laundry === true} onChange={() => setMessDetails({...messDetails, laundry: true})} /> Yes
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="laundry" checked={messDetails.laundry === false} onChange={() => setMessDetails({...messDetails, laundry: false})} /> No
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Meals (Konsumsi)</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="meals" checked={messDetails.meals === true} onChange={() => setMessDetails({...messDetails, meals: true})} /> Yes
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="meals" checked={messDetails.meals === false} onChange={() => setMessDetails({...messDetails, meals: false})} /> No
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Room Amenities (Handuk, Sabun, Sampo, Sikat Gigi)</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="amenities" checked={messDetails.amenities === true} onChange={() => setMessDetails({...messDetails, amenities: true})} /> Yes
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="amenities" checked={messDetails.amenities === false} onChange={() => setMessDetails({...messDetails, amenities: false})} /> No
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '1.5rem', padding: '1.25rem', fontSize: '1.1rem' }}>
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          Submit Request
        </button>

      </form>
    </div>
  );
};

export default NewRequest;
