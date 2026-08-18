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

const SuccessModal = ({ requestId, onClose }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon">
          <CheckCircle size={32} />
        </div>
        <h2>Request Terkirim!</h2>
        <p>Data pengajuan Anda berhasil disimpan. <strong>Harap catat ID Request Anda di bawah ini!</strong></p>
        
        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--primary-color)', margin: '1.5rem 0' }}>
          {requestId}
        </div>
        
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'left', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>
            <strong>Cara menggunakan ID Anda:</strong><br/>
            Masuk ke menu <strong>History</strong> (ikon jam) dan masukkan ID di atas untuk:<br/>
            ✅ Melihat status persetujuan (Pending / Approved / Rejected).<br/>
            ✅ Mengecek kembali detail pengajuan dan fasilitas Anda.
          </p>
        </div>

        <button className="btn btn-primary btn-full" onClick={onClose}>Lihat History</button>
      </div>
    </div>
  );
};

const NewRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingNIK, setCheckingNIK] = useState(false);
  
  // Toast & Modal state
  const [toast, setToast] = useState(null); // { message, type }
  const [successId, setSuccessId] = useState(null);
  
  const [isManualAllowed, setIsManualAllowed] = useState(false);
  
  // Form State
  const [isAGM, setIsAGM] = useState(null);
  const [nik, setNik] = useState('');
  
  // Data Diri
  const [nama, setNama] = useState('');
  const [perusahaan, setPerusahaan] = useState('');
  const [departement, setDepartement] = useState('');
  const [email, setEmail] = useState('');
  
  // Hotel Info
  const [needsHotel, setNeedsHotel] = useState(null);
  const [orderHotelHelp, setOrderHotelHelp] = useState(null);
  const [hotelPreferenceName, setHotelPreferenceName] = useState('');
  const [hotelPreferenceLocation, setHotelPreferenceLocation] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  
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
        setIsManualAllowed(false);
        showToast('Data Karyawan ditemukan', 'success');
      } else {
        showToast(res.message || 'NIK tidak ditemukan. Silakan isi data secara manual.');
        setNama(''); setPerusahaan(''); setDepartement('');
        setIsManualAllowed(true);
      }
    } catch (err) {
      showToast('Gagal memverifikasi NIK. Pastikan GAS URL sudah benar.');
    } finally {
      setCheckingNIK(false);
    }
  };

  const validateForm = () => {
    if (isAGM === null) return { msg: "Harap pilih apakah Anda Karyawan AGM", id: "field-isAGM" };
    if (isAGM && !nik) return { msg: "Harap masukkan NIK", id: "field-nik" };
    if (!nama || !perusahaan || !departement || !email) return { msg: "Harap lengkapi Data Diri termasuk Email", id: "field-nama" };
    if (!arrivalDate) return { msg: "Harap isi Arrival Date", id: "field-arrivalDate" };
    if (!departureDate) return { msg: "Harap isi Departure Date", id: "field-departureDate" };
    if (!purpose) return { msg: "Harap isi Purpose of Visit", id: "field-purpose" };
    if (needsMess === null) return { msg: "Harap pilih apakah memerlukan Mess", id: "field-needsMess" };
    if (needsMess) {
      if (messDetails.laundry === null || messDetails.meals === null || messDetails.amenities === null) {
        return { msg: "Harap lengkapi opsi Kebutuhan Fasilitas Mess", id: "field-messDetails" };
      }
    } else {
      if (needsHotel === null) return { msg: "Harap pilih apakah Anda menginap di Hotel", id: "field-needsHotel" };
      if (needsHotel) {
        if (orderHotelHelp === null) return { msg: "Harap pilih apakah perlu bantuan pemesanan", id: "field-orderHotelHelp" };
        if (orderHotelHelp) {
          if (!hotelPreferenceName || !hotelPreferenceLocation) return { msg: "Harap isi preferensi hotel Anda", id: "field-hotelPreference" };
        } else {
          if (!hotelName || !hotelLocation) return { msg: "Harap isi detail hotel Anda", id: "field-hotelDetail" };
        }
      }
    }
    if (safety.shoes && !safety.shoesSize) return { msg: "Harap masukkan ukuran Safety Shoes", id: "field-shoesSize" };
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      showToast(error.msg);
      const el = document.getElementById(error.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return;
    }

    setLoading(true);
    
    const payload = {
      isAGM,
      nik: isAGM ? nik : '-',
      nama,
      perusahaan,
      departement,
      email,
      arrivalDate,
      departureDate,
      purpose,
      transport,
      safety,
      needsMess,
      messDetails: needsMess ? messDetails : null,
      needsHotel: !needsMess ? needsHotel : null,
      orderHotelHelp: (!needsMess && needsHotel) ? orderHotelHelp : null,
      hotelPreferenceName: (!needsMess && needsHotel && orderHotelHelp) ? hotelPreferenceName : null,
      hotelPreferenceLocation: (!needsMess && needsHotel && orderHotelHelp) ? hotelPreferenceLocation : null,
      hotelName: (!needsMess && needsHotel && !orderHotelHelp) ? hotelName : null,
      hotelLocation: (!needsMess && needsHotel && !orderHotelHelp) ? hotelLocation : null
    };

    try {
      const res = await saveRequest(payload);
      if (res.status === 'success') {
        setSuccessId(res.id);

        try {
          const emailUrl = import.meta.env.VITE_GAS_EMAIL_URL;
          if (emailUrl && emailUrl.trim() !== '') {
            const emailData = {
              to_email: email,
              cc_email: 'm_haykal@baramultigroup.co.id',
              request_id: res.id,
              user_name: nama,
              company: perusahaan
            };
            
            // Note: GAS requires text/plain to avoid CORS preflight options issues
            fetch(emailUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8',
              },
              body: JSON.stringify(emailData)
            }).catch(e => console.error("Error calling GAS:", e));
          } else {
            console.log("VITE_GAS_EMAIL_URL belum dikonfigurasi, email notifikasi dilewati.");
          }
        } catch (emailErr) {
          console.error("Gagal mengirim email:", emailErr);
        }
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

      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0', borderLeft: '4px solid var(--primary-color)' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Bantuan / Contact Person (HCGA):</p>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>📞 +62 813-1891-8707 (Ari Susanto - Sect. Head HCGA)</p>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', marginTop: '0.25rem' }}>📞 +62 812-3289-0417 (Kamila Adhiba - Sub Sect. Head)</p>
      </div>
      
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
          <div className="form-group" id="field-isAGM">
            <label>Apakah Anda Karyawan AGM?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="isAGM" checked={isAGM === true} onChange={() => { setIsAGM(true); setNama(''); setPerusahaan(''); setDepartement(''); setIsManualAllowed(false); }} /> Yes
              </label>
              <label className="radio-label">
                <input type="radio" name="isAGM" checked={isAGM === false} onChange={() => { setIsAGM(false); setNik(''); setNama(''); setPerusahaan(''); setDepartement(''); setIsManualAllowed(true); }} /> No
              </label>
            </div>
          </div>

          {isAGM === true && (
            <div className="form-group">
              <label>NIK</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  id="field-nik"
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
              <div className="form-group" id="field-nama">
                <label>Nama Lengkap</label>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} readOnly={isAGM && !isManualAllowed} placeholder="Masukkan Nama Lengkap" />
              </div>
              <div className="form-group" id="field-perusahaan">
                <label>Perusahaan</label>
                <input type="text" value={perusahaan} onChange={(e) => setPerusahaan(e.target.value)} readOnly={isAGM && !isManualAllowed} placeholder="Masukkan Nama Perusahaan" />
              </div>
              <div className="form-group" id="field-departement">
                <label>Departement</label>
                <input type="text" value={departement} onChange={(e) => setDepartement(e.target.value)} readOnly={isAGM && !isManualAllowed} placeholder="Masukkan Nama Departement" />
              </div>
              <div className="form-group" id="field-email">
                <label>Email (Untuk Notifikasi)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contoh@email.com" required />
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
              <input type="date" id="field-arrivalDate" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Departure Date</label>
              <input type="date" id="field-departureDate" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Purpose of Visit</label>
            <textarea id="field-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} rows="3" placeholder="Jelaskan tujuan kunjungan Anda"></textarea>
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
                <input type="number" id="field-shoesSize" placeholder="Ukuran Sepatu (Size)" value={safety.shoesSize} onChange={(e) => setSafety({...safety, shoesSize: e.target.value})} />
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
          <div className="form-group" id="field-needsMess">
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
            <div id="field-messDetails" style={{ paddingLeft: '1.5rem', borderLeft: '4px solid var(--primary-color)', marginTop: '1.5rem' }}>
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

          {needsMess === false && (
            <div id="field-needsHotel" style={{ paddingLeft: '1.5rem', borderLeft: '4px solid #f59e0b', marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Apakah Anda menginap di Hotel?</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="needsHotel" checked={needsHotel === true} onChange={() => setNeedsHotel(true)} /> Yes
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="needsHotel" checked={needsHotel === false} onChange={() => setNeedsHotel(false)} /> No
                  </label>
                </div>
              </div>

              {needsHotel === true && (
                <div id="field-orderHotelHelp" style={{ paddingLeft: '1.5rem', borderLeft: '4px solid var(--primary-color)', marginTop: '1.5rem' }}>
                  <div className="form-group">
                    <label>Apakah perlu bantuan untuk order hotel?</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input type="radio" name="orderHotelHelp" checked={orderHotelHelp === true} onChange={() => setOrderHotelHelp(true)} /> Yes (Bantu pesankan)
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="orderHotelHelp" checked={orderHotelHelp === false} onChange={() => setOrderHotelHelp(false)} /> No (Sudah pesan sendiri)
                      </label>
                    </div>
                  </div>

                  {orderHotelHelp === true && (
                    <div id="field-hotelPreference" style={{ marginTop: '1rem' }}>
                      <div className="form-group">
                        <label>Preferensi Nama Hotel</label>
                        <input type="text" value={hotelPreferenceName} onChange={(e) => setHotelPreferenceName(e.target.value)} placeholder="Contoh: Aston / Swiss-Belhotel" />
                      </div>
                      <div className="form-group">
                        <label>Preferensi Lokasi Hotel</label>
                        <input type="text" value={hotelPreferenceLocation} onChange={(e) => setHotelPreferenceLocation(e.target.value)} placeholder="Lokasi yang diinginkan" />
                      </div>
                    </div>
                  )}

                  {orderHotelHelp === false && (
                    <div id="field-hotelDetail" style={{ marginTop: '1rem' }}>
                      <div className="form-group">
                        <label>Nama Hotel</label>
                        <input type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Nama hotel yang sudah dipesan" />
                      </div>
                      <div className="form-group">
                        <label>Lokasi Hotel</label>
                        <input type="text" value={hotelLocation} onChange={(e) => setHotelLocation(e.target.value)} placeholder="Lokasi hotel" />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
