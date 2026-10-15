const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const pharmacyCreate = async (counter, staff, hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pharmacy/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        counter,
        staff,
        hospitalId,
        status: 'active',
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const allpharmacy = async (hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pharmacy/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hospitalId,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updatePharmacy = async (pharmacyId, counter, staff, status = 'active') => {
  try {
    const response = await fetch(`${API_BASE_URL}/pharmacy/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pharmacyId,
        counter,
        staff,
        status,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deletePharmacy = async (pharmacyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pharmacy/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pharmacyId,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

