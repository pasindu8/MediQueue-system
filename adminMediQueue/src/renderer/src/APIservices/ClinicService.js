const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const allClinics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinic/all`, {
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

export const allashospitalClinics = async (hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinic/allhc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hospitalId
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


export const createClinic = async (hospitalId, name, roomNumber, services, timeSlots, status = 'active') => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinic/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hospitalId,
        name,
        roomNumber,
        status,
        services,
        timeSlots
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateClinic = async (clinicId, name, roomNumber, services, timeSlots, status = 'active') => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinic/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clinicId,
        name,
        roomNumber,
        status,
        services,
        timeSlots,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deleteClinic = async (clinicId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinic/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clinicId,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};