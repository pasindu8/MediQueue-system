const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const doctorCreate = async (slmc, specialty, hospitalId, clinicId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctor/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        StaffID: slmc,
        specialty,
        hospitalId,
        clinicId,
        status: 'Available',
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const allDoctors = async (hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctor/all`, {
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

export const getAllDoctorsList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctor/getAllDoctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateDoctor = async (doctorId, slmc, specialty, clinicId, status = 'Available') => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctor/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorId,
        slmc,
        specialty,
        clinicId,
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

export const deleteDoctor = async (doctorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctor/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorId,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


