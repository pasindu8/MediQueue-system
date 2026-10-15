const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createHospital = async (name, district, category, adminEmail) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hospital/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        district: district,
        category: category,
        assignedITLead: adminEmail,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getAllHospitals = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/hospital/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getHospitalDetails = async (hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hospital/details`, {
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



