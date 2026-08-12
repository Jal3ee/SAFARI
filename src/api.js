// Update with the exact URL provided by user
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzZD7pj6pJ-86F6w9-JyYqdD4gS5C6Zv0qijGazdbdHNbBYREYZNnWp29-U6i84CgwYeQ/exec';

/**
 * Saves a new request to GAS.
 */
export const saveRequest = async (data) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("GAS Error HTML:", text);
      throw new Error("Terjadi error di Google Script (Mungkin nama Sheet salah atau Google Multi-login issue). Coba gunakan Incognito Window.");
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
    const response = await fetch(`${GAS_URL}?action=get_all`);
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
    const response = await fetch(`${GAS_URL}?action=get_request&id=${id}`);
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
    const response = await fetch(`${GAS_URL}?action=verify_nik&nik=${nik}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying NIK:', error);
    throw new Error('Terjadi kesalahan jaringan saat memverifikasi NIK.');
  }
};
