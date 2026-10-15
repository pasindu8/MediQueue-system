const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const labCreate = async (unit, staff, sampleTypes, hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lab/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        unit,
        staff,
        sampleTypes,
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

export const allLabs = async (hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lab/all`, {
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

export const updateLab = async (labId, unit, staff, sampleTypes, status = 'active') => {
  try {
    const response = await fetch(`${API_BASE_URL}/lab/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        labId,
        unit,
        staff,
        sampleTypes,
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

export const deleteLab = async (labId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lab/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        labId,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

