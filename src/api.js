import { supabase } from './supabaseClient';

/**
 * Saves a new request to Supabase.
 */
export const saveRequest = async (data) => {
  try {
    // Generate a short 6-character alphanumeric ID (e.g. REQ-A4B8X9)
    const shortId = 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: result, error } = await supabase
      .from('requests')
      .insert([
        {
          id: shortId,
          is_agm: data.isAGM,
          nik: data.nik || null,
          nama: data.nama,
          perusahaan: data.perusahaan,
          departement: data.departement,
          arrival_date: data.arrivalDate,
          departure_date: data.departureDate,
          purpose: data.purpose,
          transport_airport: data.transport?.airport || false,
          transport_airport_note: data.transport?.airportNote || null,
          transport_site: data.transport?.site || false,
          transport_site_note: data.transport?.siteNote || null,
          transport_return: data.transport?.returnTransport || false,
          transport_return_note: data.transport?.returnNote || null,
          safety_shoes: data.safety?.shoes || false,
          safety_shoes_size: data.safety?.shoesSize || null,
          safety_vest: data.safety?.vest || false,
          safety_helm: data.safety?.helm || false,
          needs_mess: data.needsMess || false,
          mess_laundry: data.messDetails?.laundry ?? null,
          mess_meals: data.messDetails?.meals ?? null,
          mess_amenities: data.messDetails?.amenities ?? null,
          status: 'Pending'
        }
      ])
      .select('id')
      .single();

    if (error) throw error;
    
    return { status: 'success', id: result.id };
  } catch (error) {
    console.error('Error saving request:', error);
    throw new Error('Terjadi error saat menyimpan data ke database. Silakan coba lagi.');
  }
};

/**
 * Updates request status
 */
export const updateRequestStatus = async (id, newStatus) => {
  try {
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    throw new Error('Gagal memperbarui status');
  }
};

/**
 * Fetches all requests from Supabase (Used by Admin).
 */
export const fetchRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map snake_case to camelCase for frontend components
    return data.map(req => ({
      id: req.id,
      timestamp: req.created_at,
      status: req.status,
      isAGM: req.is_agm,
      nik: req.nik,
      nama: req.nama,
      perusahaan: req.perusahaan,
      departement: req.departement,
      arrivalDate: req.arrival_date,
      departureDate: req.departure_date,
      purpose: req.purpose,
      transport: {
        airport: req.transport_airport,
        airportNote: req.transport_airport_note,
        site: req.transport_site,
        siteNote: req.transport_site_note,
        returnTransport: req.transport_return,
        returnNote: req.transport_return_note
      },
      safety: {
        shoes: req.safety_shoes,
        shoesSize: req.safety_shoes_size,
        vest: req.safety_vest,
        helm: req.safety_helm
      },
      needsMess: req.needs_mess,
      messDetails: {
        laundry: req.mess_laundry,
        meals: req.mess_meals,
        amenities: req.mess_amenities
      }
    }));
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

/**
 * Fetches a single request by ID (Used by History).
 */
export const fetchRequestById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) {
      throw new Error("Request ID tidak ditemukan");
    }
    
    return {
      id: data.id,
      timestamp: data.created_at,
      status: data.status,
      isAGM: data.is_agm,
      nik: data.nik,
      nama: data.nama,
      perusahaan: data.perusahaan,
      departement: data.departement,
      arrivalDate: data.arrival_date,
      departureDate: data.departure_date,
      purpose: data.purpose,
      transport: {
        airport: data.transport_airport,
        airportNote: data.transport_airport_note,
        site: data.transport_site,
        siteNote: data.transport_site_note,
        returnTransport: data.transport_return,
        returnNote: data.transport_return_note
      },
      safety: {
        shoes: data.safety_shoes,
        shoesSize: data.safety_shoes_size,
        vest: data.safety_vest,
        helm: data.safety_helm
      },
      needsMess: data.needs_mess,
      messDetails: {
        laundry: data.mess_laundry,
        meals: data.mess_meals,
        amenities: data.mess_amenities
      }
    };
  } catch (error) {
    console.error('Error fetching request by ID:', error);
    throw error;
  }
};

/**
 * Verify NIK against 'karyawan' table.
 */
export const verifyNIK = async (nik) => {
  try {
    const { data, error } = await supabase
      .from('karyawan')
      .select('nama, perusahaan, departement')
      .eq('nik', nik)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "No rows returned" - which just means NIK not found.
      throw error;
    }
    
    if (data) {
      return { success: true, data };
    } else {
      return { success: false, message: 'NIK tidak ditemukan di database.' };
    }
  } catch (error) {
    console.error('Error verifying NIK:', error);
    throw new Error('Terjadi kesalahan jaringan saat memverifikasi NIK.');
  }
};
