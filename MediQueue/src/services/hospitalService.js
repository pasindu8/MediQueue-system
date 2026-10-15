import { BASE_URL } from './api';

export const getHospitalDetails = async (hospitalId) => {
  try {
    const response = await fetch(`${BASE_URL}/hospital/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hospitalId: hospitalId,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const allHospitals = async () => {
  try {
    const response = await fetch(`${BASE_URL}/hospital/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
