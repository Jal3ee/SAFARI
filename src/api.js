// Proxy endpoint that routes to Google Apps Script
// Solves CORS and Multi-login issues
const API_URL = '/api/gas';

/**
 * Saves a new request to GAS.
 */
export const saveRequest = async (data) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Server Error HTML:", text);
      throw new Error("Terjadi error di server. Silakan coba lagi.");
    }
  } catch (error) {
    console.error('Error saving request:', error);
    throw error;
  }
};

/**
 * Fetches all requests from GAS (Used by Admin).
 */
export const fetchRequests = async () => {
  try {
    const response = await fetch(`${API_URL}?action=get_all`);
    return await response.json();
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
    const response = await fetch(`${API_URL}?action=get_request&id=${id}`);
    const data = await response.json();
    if (data.status === 'error') {
      throw new Error(data.message);
    }
    return data.data;
  } catch (error) {
    console.error('Error fetching request by ID:', error);
    throw error;
  }
};

/**
 * Verify NIK against 'Karyawan' sheet.
 */
export const verifyNIK = async (nik) => {
  try {
    const response = await fetch(`${API_URL}?action=verify_nik&nik=${nik}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying NIK:', error);
    throw new Error('Terjadi kesalahan jaringan saat memverifikasi NIK.');
  }
};
