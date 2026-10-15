import { BASE_URL } from './api';

export const getPatientDetails = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/patient/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const createAppointment = async (
  patientId,
  hospitalId,
  appointmentDate,
  appointmentTime,
  clinicDetails = {}
) => {
  try {
    const response = await fetch(`${BASE_URL}/appointment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId,
        hospitalId,
        appointmentDate,
        appointmentTime,
        clinicId: clinicDetails.clinicId || null,
        clinicName: clinicDetails.clinicName || null,
        roomNumber: clinicDetails.roomNumber || null,
        service: clinicDetails.service || null,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getPatientAppointmentDetails = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/appointment/user/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getPatientPrescriptionsAndLabs = async (userId, patientId) => {
  try {
    const response = await fetch(`${BASE_URL}/clinical/patient/prescriptions-and-labs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, patientId }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error in getPatientPrescriptionsAndLabs:', error);
    return { ok: false, data: { prescriptions: [], labOrders: [] } };
  }
};