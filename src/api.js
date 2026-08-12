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
          transport_site: data.transport?.site || false,
          transport_return: data.transport?.returnTransport || false,
          needs_mess: data.needsMess || false,
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
        site: req.transport_site,
        returnTransport: req.transport_return
      },
      needsMess: req.needs_mess
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
        site: data.transport_site,
        returnTransport: data.transport_return
      },
      needsMess: data.needs_mess
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
