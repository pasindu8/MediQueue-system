const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginPhone = async (email , password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/loginadmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const registerAssigned = async (email , password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/registerAssigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const registerOfficer = async (ofname, StaffID, email, phoneNumber, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: ofname,
        StaffID: StaffID,
        email: email,
        phoneNumber: phoneNumber,
        password: password,
        role: "it_support",
      }),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const allOfficer = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/all`, {
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



