const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const doctorInfo = async (adminId) => {
  try {
    console.log('Fetching doctor info for adminId:', adminId);
    const response = await fetch(`${API_BASE_URL}/doctor/gacd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminId
      }),
    });

    const data = await response.json();
    console.log('Doctor info response:', data);
    console.log('Doctor info response1:', data.doctor);
    console.log('Doctor info response2:', data.doctor.hospitalId);
    console.log('Doctor info response3:', data.doctor.clinicId);

   if (data.success) {

      const response1 = await fetch(`${API_BASE_URL}/hospital/details`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            hospitalId: data.doctor.hospitalId
        }),
      });
      const data1 = await response1.json();
      console.log('Hospital info response:', data1);
      const response2 = await fetch(`${API_BASE_URL}/clinic/getDetails`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            clinicId: data.doctor.clinicId
        }),
      });
      const data2 = await response2.json();
        console.log('Clinic info response:', data2);
        if (data1.success && data2.success) {
            console.log('Doctor Info:', data.doctor);
            console.log('Hospital Info:', data1.hospital);
            console.log('Clinic Info:', data2.data);
            return {
                doctorInfo: data.doctor,
                hospitalInfo: data1.hospital,
                clinicInfo: data2.data
            };
        } else {
            throw new Error(data1.message || data2.message || 'Failed to fetch doctor or clinic info');
        }

    }else {
      throw new Error(data.message || 'Failed to fetch doctor info');
    }
    console.log('Error fetching doctor info:', data.message);

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Fetch today's waiting queue (appointments) for a hospital/clinic
export const fetchQueueByHospital = async (hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointment/getByHospital`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hospitalId }),
    });

    const data = await response.json();
    if (data.success) {
      return data.appointments || [];
    }
    return [];
  } catch (error) {
    console.error('Queue fetch error:', error);
    return [];
  }
};

// Fetch full patient details by patientId (for dashboard display)
export const fetchPatientDetails = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId }),
    });

    const data = await response.json();
    if (data.success) {
      return data.patient || null;
    }
    return null;
  } catch (error) {
    console.error('Patient fetch error:', error);
    return null;
  }
};

// Finish consultation: transmits prescriptions to pharmacy, lab orders to lab, marks appointment completed
export const finishConsultation = async (consultationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinical/doctor/finish-consultation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consultationData),
    });
    return await response.json();
  } catch (error) {
    console.error('finishConsultation error:', error);
    throw error;
  }
};

// Pharmacy queue fetch
export const getPharmacyQueue = async (hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinical/pharmacy/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hospitalId }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('getPharmacyQueue error:', error);
    return { ok: false, data: null };
  }
};

// Dispense prescription
export const dispensePrescription = async (prescriptionId, token, pharmacistName, counter) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinical/pharmacy/dispense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prescriptionId, token, pharmacistName, counter }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('dispensePrescription error:', error);
    return { ok: false, data: null };
  }
};

// Skip prescription
export const skipPrescription = async (prescriptionId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinical/pharmacy/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prescriptionId, token }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('skipPrescription error:', error);
    return { ok: false, data: null };
  }
};

// Lab queue fetch
export const getLabQueue = async (hospitalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinical/lab/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hospitalId }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('getLabQueue error:', error);
    return { ok: false, data: null };
  }
};

// Verify and publish lab report (supports either JSON payload or FormData with attached reportFile)
export const verifyAndPublishLabReport = async (payloadOrId, token, technologistName, isCriticalFlagged, criticalNote, results, unit, status, reportFile) => {
  try {
    let body;
    let fileToUpload = null;

    if (typeof payloadOrId === 'object' && payloadOrId !== null) {
      fileToUpload = payloadOrId.file || (payloadOrId.reportFile instanceof File ? payloadOrId.reportFile : null);
      body = {
        labOrderId: payloadOrId.labOrderId || payloadOrId._id,
        token: payloadOrId.token,
        technologistName: payloadOrId.technologistName,
        isCriticalFlagged: payloadOrId.isCriticalFlagged !== undefined ? payloadOrId.isCriticalFlagged : payloadOrId.isCritical,
        criticalNote: payloadOrId.criticalNote,
        results: payloadOrId.results,
        unit: payloadOrId.unit,
        status: payloadOrId.status || 'verified',
        reportFile: typeof payloadOrId.reportFile === 'string' ? payloadOrId.reportFile : undefined,
        reportFileName: payloadOrId.reportFileName,
        reportFileSize: payloadOrId.reportFileSize,
      };
    } else {
      fileToUpload = reportFile instanceof File ? reportFile : null;
      body = {
        labOrderId: payloadOrId,
        token,
        technologistName,
        isCriticalFlagged,
        criticalNote,
        results,
        unit,
        status: status || 'verified',
        reportFile: typeof reportFile === 'string' ? reportFile : undefined,
      };
    }

    let response;
    if (fileToUpload) {
      const formData = new FormData();
      formData.append('reportFile', fileToUpload);
      Object.keys(body).forEach((key) => {
        if (body[key] !== undefined && body[key] !== null) {
          if (typeof body[key] === 'object') {
            formData.append(key, JSON.stringify(body[key]));
          } else {
            formData.append(key, body[key]);
          }
        }
      });
      response = await fetch(`${API_BASE_URL}/clinical/lab/verify-publish`, {
        method: 'POST',
        body: formData,
      });
    } else {
      response = await fetch(`${API_BASE_URL}/clinical/lab/verify-publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    }

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('verifyAndPublishLabReport error:', error);
    return { ok: false, data: null };
  }
};

// Upload lab report document/image directly
export const uploadLabReportFile = async (file, labOrderId, token) => {
  try {
    const formData = new FormData();
    formData.append('reportFile', file);
    if (labOrderId) formData.append('labOrderId', labOrderId);
    if (token) formData.append('token', token);

    const response = await fetch(`${API_BASE_URL}/clinical/lab/upload-report`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('uploadLabReportFile error:', error);
    return { ok: false, data: null, message: error.message };
  }
};

// Download URL helper for lab reports
export const getLabReportDownloadUrl = (orderIdOrToken) => {
  return `${API_BASE_URL}/clinical/lab/download-report/${orderIdOrToken}`;
};

// Direct static URL helper for lab reports (for previewing PDF or image in new tab)
export const getReportFileStaticUrl = (relativeFilePath) => {
  if (!relativeFilePath) return '';
  if (relativeFilePath.startsWith('http://') || relativeFilePath.startsWith('https://')) {
    return relativeFilePath;
  }
  return `${API_BASE_URL}${relativeFilePath.startsWith('/') ? '' : '/'}${relativeFilePath}`;
};

// Fetch all lab orders for a patient (for Doctor desk)
export const fetchPatientLabs = async (patientId, patientName, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinical/doctor/patient-labs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId, patientName, token }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('fetchPatientLabs error:', error);
    return { ok: false, data: null };
  }
};

// Create / seed sample lab order for testing
export const createSampleLabOrder = async (hospitalId, testName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clinical/lab/sample-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hospitalId, testName }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('createSampleLabOrder error:', error);
    return { ok: false, data: null };
  }
};


