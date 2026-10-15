import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, QrCode, Pill, FlaskConical, Plus, Trash2, LogOut, ShieldAlert, Activity, Check, Send, Download, Eye, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  doctorInfo as fetchDoctorDeskData,
  fetchQueueByHospital,
  finishConsultation,
  fetchPatientLabs,
  getLabReportDownloadUrl,
  getReportFileStaticUrl
} from '../APIservices/mixService';
import { useToast } from '../components/ToastContext';


export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState({});
  const [consultationsToday, setConsultationsToday] = useState(0);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [newDrug, setNewDrug] = useState({ drug: '', dose: '', days: '' });
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [qrScanNotification, setQrScanNotification] = useState(null);
  const pollingRef = React.useRef(null);
  const knownTokensRef = React.useRef(new Set()); 
  const initialLoadDoneRef = React.useRef(false);

  useEffect(() => {
    loadDoctorData();
  }, []);

  useEffect(() => {
    if (Object.keys(doctorInfo).length > 0) {
      
      if (doctorInfo.hospitalId) {
        startQueuePolling(doctorInfo.hospitalId);
      }
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [doctorInfo]);


  const loadDoctorData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('adminUser');
      if (!storedUser) {
        navigate('/');
        return;
      }

      const parsed = JSON.parse(storedUser);
      const targetAdminId = parsed.adminId || parsed._id || parsed.id;

      const result = await fetchDoctorDeskData(targetAdminId);

      if (result) {
        setDoctorInfo({
          name: parsed.name || 'N/A',
          slmc: parsed.StaffID || 'N/A',
          specialty: result.doctorInfo?.specialty || 'N/A',
          doctorId: result.doctorInfo?._id || result.doctorInfo?.id,
          hospitalId: result.hospitalInfo?._id || result.doctorInfo?.hospitalId,
          hospitalName: result.hospitalInfo?.name || 'N/A',
          clinicId: result.clinicInfo?._id || result.doctorInfo?.clinicId,
          clinicName: result.clinicInfo?.name || 'N/A',
          roomNumber: result.clinicInfo?.roomNumber || 'N/A',
        });
      }
    } catch (err) {
      useToast('error', 'Failed to load doctor data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startQueuePolling = (hospitalId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    const poll = async () => {
      try {
        const appointments = await fetchQueueByHospital(hospitalId);
        if (!appointments || appointments.length === 0) {
          setWaitingQueue([]);
          return;
        }

        // The dashboard must display persisted appointments only. Do not create
        // or synthesize queue entries from incomplete API payloads.
        const newQueueItems = appointments
          .filter((apt) => apt && apt._id && (apt.tokenNumber || apt.token))
          .map((apt) => ({
          _id: apt._id,
          appointmentId: apt.appointmentId || apt._id,
          token: apt.tokenNumber || apt.token || 'N/A',
          name: apt.name || apt.patientName || 'N/A',
          age: apt.age || 0,
          gender: apt.gender || 'N/A',
          bloodGroup: apt.bloodGroup || 'N/A',
          phn: apt.phn || 'N/A',
          allergies: apt.allergies || ['None reported'],
          chronicConditions: apt.chronicConditions || ['N/A'],
          pastMedications: apt.pastMedications || [
            { drug: 'N/A', dosage: 'N/A', duration: 'N/A' },
          ],
          pastLabReports: apt.pastLabReports || [
            { test: 'N/A', result: 'N/A', date: 'N/A', flag: 'N/A' },
          ],
          pastNotes: apt.pastNotes || 'N/A',
          reason: apt.reason || 'N/A',
          patientId: apt.patientId,
        }));

        setWaitingQueue(newQueueItems);

        if (!initialLoadDoneRef.current) {
          initialLoadDoneRef.current = true;
          newQueueItems.forEach((item) => knownTokensRef.current.add(item._id || item.token));
          setActivePatient((current) => {
            if (!current && newQueueItems.length > 0) {
              const firstPatient = newQueueItems[0];
              return {
                appointmentId: firstPatient.appointmentId,
                patientId: firstPatient.patientId,
                token: firstPatient.token,
                phn: firstPatient.phn,
                name: firstPatient.name,
                age: firstPatient.age,
                gender: firstPatient.gender,
                bloodGroup: firstPatient.bloodGroup,
                allergies: firstPatient.allergies,
                chronicConditions: firstPatient.chronicConditions,
                pastMedications: firstPatient.pastMedications,
                pastLabReports: firstPatient.pastLabReports,
                pastNotes: firstPatient.pastNotes,
              };
            }
            return current;
          });
          return;
        }

        const newlyAdded = newQueueItems.filter(
          (item) => !knownTokensRef.current.has(item._id || item.token)
        );

        if (newlyAdded.length > 0) {
          const newest = newlyAdded[0]; 

          setShowQRModal(false);

          setQrScanNotification(newest);
          setTimeout(() => setQrScanNotification(null), 5000);

          setPrescriptions([]);
          setSelectedLabTests([]);
          setCurrentDiagnosis('');
          setDoctorNotes('');

          setActivePatient({
            appointmentId: newest.appointmentId,
            patientId: newest.patientId,
            token: newest.token,
            phn: newest.phn,
            name: newest.name,
            age: newest.age,
            gender: newest.gender,
            bloodGroup: newest.bloodGroup,
            allergies: newest.allergies,
            chronicConditions: newest.chronicConditions,
            pastMedications: newest.pastMedications,
            pastLabReports: newest.pastLabReports,
            pastNotes: newest.pastNotes,
          });

          newlyAdded.forEach((item) => knownTokensRef.current.add(item._id || item.token));
        }
      } catch (err) {
        showToast('error', 'Failed to load queue data. Please try again.');
      }
    };

    poll(); 
    pollingRef.current = setInterval(poll, 2000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleAddMedication = () => {
    if (!newDrug.drug.trim()) return;
    setPrescriptions([...prescriptions, { ...newDrug, id: Date.now() }]);
    setNewDrug({ drug: '', dose: '', days: '' });
  };

  const handleRemoveMedication = (id) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const toggleLabTest = (testName) => {
    if (selectedLabTests.includes(testName)) {
      setSelectedLabTests(selectedLabTests.filter((t) => t !== testName));
    } else {
      setSelectedLabTests([...selectedLabTests, testName]);
    }
  };

  const loadPatientLabs = async (patientId, patientName, token) => {
    try {
      const res = await fetchPatientLabs(patientId, patientName, token);
      if (res.ok && Array.isArray(res.data?.labOrders) && res.data.labOrders.length > 0) {
        const formatted = res.data.labOrders.map((lab) => {
          const topParam = lab.results?.[0];
          const summary = topParam
            ? `${topParam.param}: ${topParam.value} ${topParam.unit || ''}`.trim()
            : (lab.results?.length ? `${lab.results.length} parameters` : (lab.status === 'verified' ? 'Verified' : 'Pending'));
          return {
            _id: lab._id,
            token: lab.tokenNumber,
            test: lab.testName,
            result: summary,
            results: lab.results || [],
            date: lab.verifiedAt ? new Date(lab.verifiedAt).toLocaleDateString('en-GB') : new Date(lab.createdAt).toLocaleDateString('en-GB'),
            flag: lab.isCriticalFlagged ? 'High' : 'Normal',
            status: lab.status,
            reportFile: lab.reportFile || '',
            reportFileName: lab.reportFileName || '',
            reportFileSize: lab.reportFileSize || '',
            verifiedBy: lab.verifiedBy || '',
          };
        });
        setActivePatient((prev) => (prev ? { ...prev, pastLabReports: formatted } : prev));
      }
    } catch (e) {
      useToast('error', 'Could not load patient lab reports.');
    }
  };

  const selectPatientFromQueue = (patientItem) => {
    setActivePatient({
      appointmentId: patientItem.appointmentId || patientItem._id,
      patientId: patientItem.patientId,
      token: patientItem.token || patientItem.tokenNumber,
      phn: patientItem.phn || `PHN-000`,
      name: patientItem.name,
      age: patientItem.age,
      gender: patientItem.gender,
      bloodGroup: patientItem.bloodGroup || 'N/A',
      allergies: patientItem.allergies || ['None reported'],
      chronicConditions: patientItem.chronicConditions || [patientItem.reason || 'N/A'],
      pastMedications: patientItem.pastMedications || [
        { drug: 'N/A', dosage: 'N/A', duration: 'N/A' },
      ],
      pastLabReports: patientItem.pastLabReports || [
        { test: 'N/A', result: 'N/A', date: 'N/A', flag: 'N/A' },
      ],
      pastNotes: patientItem.pastNotes || 'N/A',
    });
    setPrescriptions([]);
    setSelectedLabTests([]);
    setCurrentDiagnosis('');
    setDoctorNotes('');

    loadPatientLabs(patientItem.patientId, patientItem.name, patientItem.token);
  };

  const handleSimulateQRScan = () => {
    if (waitingQueue.length > 0) {
      selectPatientFromQueue(waitingQueue[0]);
      setShowQRModal(false);
    } else {
      useToast('error', 'Waiting queue is currently empty. Please ask the patient to scan the desk QR code using the MediQueue Mobile App.');
      setShowQRModal(false);
    }
  };


  const handleFinishConsultation = async () => {
    if (!activePatient) return;

    try {
      await finishConsultation({
        hospitalId: doctorInfo.hospitalId,
        doctorId: doctorInfo.doctorId,
        doctorName: doctorInfo.name,
        clinicName: doctorInfo.clinicName,
        roomNumber: doctorInfo.roomNumber,
        tokenNumber: activePatient.token,
        patientId: activePatient.patientId,
        patientName: activePatient.name,
        patientAge: activePatient.age,
        patientGender: activePatient.gender,
        allergies: activePatient.allergies,
        diagnosis: currentDiagnosis,
        doctorNotes: doctorNotes,
        prescriptions: prescriptions,
        selectedLabTests: selectedLabTests,
      });

      setConsultationsToday((prev) => prev + 1);
      useToast('success', `Consultation for ${activePatient.name} (Token ${activePatient.token}) completed!\nPrescriptions and Lab orders sent to respective departments.`);

      const remaining = waitingQueue.filter((p) => (p.token || p.tokenNumber) !== activePatient.token);
      setWaitingQueue(remaining);

      if (remaining.length > 0) {
        selectPatientFromQueue(remaining[0]);
      } else {
        setActivePatient(null);
      }
    } catch (err) {
      useToast('error', 'Failed to transmit consultation records to the server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const qrCodePayload = JSON.stringify({
    type: 'MEDIQUEUE_DESK',
    hospitalId: doctorInfo.hospitalId || 'N/A',
    clinicId: doctorInfo.clinicId || 'N/A',
    doctorId: doctorInfo.doctorId || 'N/A',
    doctorName: doctorInfo.name,
    roomNumber: doctorInfo.roomNumber,
    clinicName: doctorInfo.clinicName,
  });

  return (
    <div className="flex h-screen bg-[#F0F4F8] font-sans antialiased overflow-hidden text-slate-800">

      {/* ===== QR SCAN NOTIFICATION TOAST ===== */}
      {qrScanNotification && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)',
            color: 'white',
            borderRadius: '16px',
            padding: '14px 20px',
            boxShadow: '0 8px 32px rgba(13,148,136,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '320px',
            animation: 'slideInRight 0.4s ease',
          }}
        >
          <div style={{ fontSize: '24px' }}>📱</div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '13px', margin: 0 }}>📱 Patient QR Connected!</p>
            <p style={{ fontSize: '12px', opacity: 0.95, margin: '2px 0 0' }}>
              <strong>{qrScanNotification.name}</strong> ({qrScanNotification.token}) medical records loaded
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ===================== SIDEBAR ===================== */}
      <aside className="w-60 bg-[#0F1B2F] flex flex-col justify-between shrink-0 select-none text-slate-300 shadow-xl">
        <div>
          <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl bg-[#0D9488] flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">MediQueue</span>
              <span className="block text-[10px] text-[#2DD4BF] font-semibold">Doctor Clinical Portal</span>
            </div>
          </div>

          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active Duty Desk</p>
            <h4 className="text-sm font-bold text-white mt-0.5 truncate">
              {doctorInfo.roomNumber || 'Room --'} - {doctorInfo.clinicName || 'Clinic'}
            </h4>
            <p className="text-xs text-[#38BDF8] font-medium mt-0.5 truncate">
              {doctorInfo.hospitalName || 'N/A'}
            </p>

            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              className="mt-3 w-full py-2.5 px-3 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Show Desk QR Code
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Consultations Today:</span>
              <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded font-mono">{consultationsToday}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Patients in Queue:</span>
              <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-mono">
                {waitingQueue.length}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden pr-2">
              <p className="text-xs font-bold text-white truncate">{doctorInfo.name || 'N/A'}</p>
              <p className="text-[10px] text-slate-400 truncate">{doctorInfo.specialty || 'N/A'}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer shrink-0"
              title="End Shift"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CLINICAL WORKSPACE ===================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activePatient ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-xs font-bold text-slate-700">Currently Attending:</span>
              <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-[#0D9488] font-mono font-extrabold text-sm rounded-lg">
                {activePatient ? activePatient.token : 'No Active Patient'}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
              <span className="text-xs font-semibold text-slate-400">Next Up:</span>
              {waitingQueue.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Queue Empty</span>
              ) : (
                waitingQueue.slice(0, 4).map((p, idx) => (
                  <button
                    type="button"
                    key={p.token || idx}
                    onClick={() => selectPatientFromQueue(p)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 hover:text-[#0D9488] text-slate-600 text-[11px] font-mono font-bold rounded cursor-pointer transition border border-slate-200"
                    title={`Click to load ${p.name}`}
                  >
                    {p.token}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live polling indicator */}
            {doctorInfo.hospitalId && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700">Live Scanning</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSimulateQRScan}
              className="px-3 py-1.5 bg-blue-50 text-[#1D4ED8] hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              Simulate Patient QR Scan
            </button>

            <button
              type="button"
              onClick={handleFinishConsultation}
              disabled={!activePatient}
              className="px-4 py-2 bg-[#127C55] hover:bg-[#0B5338] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Finish & Call Next
            </button>
          </div>
        </header>

        {/* Clinical Workspace */}
        <main className="p-6 max-w-[1700px] w-full mx-auto flex-1">
          {activePatient ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT COLUMN: PATIENT MEDICAL PASSPORT */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900">{activePatient.name}</h2>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                          {activePatient.age} Yrs / {activePatient.gender}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{activePatient.phn}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Blood Group</span>
                      <span className="text-base font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                        {activePatient.bloodGroup}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl">
                    <div className="flex items-center gap-2 text-rose-800 font-black text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Known Allergies & Reactions
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {activePatient.allergies?.map((allergy, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded">
                          ⚠️ {allergy}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                      Chronic Diagnoses
                    </span>
                    <p className="text-xs font-semibold text-amber-900">
                      {activePatient.chronicConditions?.join(' • ')}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <Pill className="w-4 h-4 text-[#0D9488]" />
                    <h3 className="text-sm font-bold text-slate-900">Previously Prescribed Drugs</h3>
                  </div>

                  <div className="space-y-2.5">
                    {activePatient.pastMedications?.map((med, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{med.drug}</p>
                          <p className="text-[11px] text-slate-500">{med.dosage}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {med.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-[#2563EB]" />
                        <h3 className="text-sm font-bold text-slate-900">Lab Investigation Results</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {activePatient.pastLabReports?.length || 0} Records
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activePatient.pastLabReports && activePatient.pastLabReports.length > 0 ? (
                        activePatient.pastLabReports.map((report, idx) => (
                          <div key={report._id || idx} className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100 text-xs space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-800 block text-xs">{report.test}</span>
                                <span className="text-[10px] text-slate-400">
                                  {report.date} {report.token ? `• Token: ${report.token}` : ''}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-slate-800 block">{report.result}</span>
                                <span
                                  className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    report.flag === 'High' || report.flag === 'Warning' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {report.flag || 'Normal'}
                                </span>
                              </div>
                            </div>

                            {/* Downloadable / Attached Official Lab Report */}
                            {report.reportFile ? (
                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 bg-white/80 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span className="text-[11px] font-medium text-slate-700 truncate" title={report.reportFileName}>
                                    {report.reportFileName || 'Diagnostic_Report.pdf'}
                                  </span>
                                  {report.reportFileSize ? (
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                      ({report.reportFileSize})
                                    </span>
                                  ) : null}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <a
                                    href={getReportFileStaticUrl(report.reportFile)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 text-[11px] font-bold text-[#0F5A71] hover:bg-cyan-50 rounded flex items-center gap-1 transition"
                                    title="Preview in new tab"
                                  >
                                    <Eye className="w-3 h-3" />
                                    View
                                  </a>
                                  <a
                                    href={getLabReportDownloadUrl(report._id || report.token)}
                                    download
                                    className="px-2 py-0.5 text-[11px] font-bold text-white bg-[#0F5A71] hover:bg-[#0c485a] rounded flex items-center gap-1 shadow-xs transition"
                                    title="Download Report Document"
                                  >
                                    <Download className="w-3 h-3" />
                                    Download
                                  </a>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2">No laboratory reports recorded for this patient.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Last Consultation Note
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{activePatient.pastNotes}"
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: CLINICAL ACTIONS & RX */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#127C55]" />
                    Current Consultation Diagnosis & Notes
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      value={currentDiagnosis}
                      onChange={(e) => setCurrentDiagnosis(e.target.value)}
                      placeholder="e.g. Upper Respiratory Tract Infection (URTI)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#0D9488] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Doctor Clinical Observations / Advice
                    </label>
                    <textarea
                      rows={2}
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Enter advice given to the patient, diet suggestions..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#0D9488] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-[#0B5338]" />
                      <h3 className="text-sm font-bold text-slate-900">Prescribe Medicines</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{prescriptions.length} Item(s)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 mb-3">
                    <input
                      type="text"
                      value={newDrug.drug}
                      onChange={(e) => setNewDrug({ ...newDrug, drug: e.target.value })}
                      placeholder="Drug name (e.g. Amoxicillin 500mg)"
                      className="sm:col-span-5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={newDrug.dose}
                      onChange={(e) => setNewDrug({ ...newDrug, dose: e.target.value })}
                      placeholder="Dosage (e.g. 1 TDS)"
                      className="sm:col-span-4 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={newDrug.days}
                      onChange={(e) => setNewDrug({ ...newDrug, days: e.target.value })}
                      placeholder="Duration (5 days)"
                      className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedication}
                      className="sm:col-span-1 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-lg flex items-center justify-center p-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {prescriptions.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{p.drug}</span>
                          <span className="text-slate-500 ml-2">({p.dose} • {p.days})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <FlaskConical className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-sm font-bold text-slate-900">Order Diagnostic Tests</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      'Full Blood Count (FBC)',
                      'Fasting Blood Sugar (FBS)',
                      'Lipid Profile',
                      'Serum Creatinine',
                      'Urine Full Report (UFR)',
                      'Dengue NS1 Antigen',
                    ].map((testName) => {
                      const isSelected = selectedLabTests.includes(testName);
                      return (
                        <button
                          type="button"
                          key={testName}
                          onClick={() => toggleLabTest(testName)}
                          className={`p-2.5 rounded-xl border text-left font-semibold transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate pr-1">{testName}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => alert(`Marked Token ${activePatient.token} as Absent/Skipped.`)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Skip (Patient Absent)
                  </button>

                  <button
                    type="button"
                    onClick={handleFinishConsultation}
                    className="flex-1 py-3.5 bg-[#127C55] hover:bg-[#0B5338] text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Transmit Orders & Call Next Patient
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-[#0D9488] mx-auto mb-3">
                <QrCode className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Waiting for Patient QR Scan</h2>
              <button
                type="button"
                onClick={handleSimulateQRScan}
                className="mt-4 px-5 py-2.5 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Simulate Patient QR Scan Handshake
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ===================== QR CODE MODAL ===================== */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{doctorInfo.roomNumber || 'Room 00'} Desk QR</h3>
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 bg-[#F8FAFC] border-2 border-dashed border-[#0D9488]/40 rounded-2xl flex flex-col items-center justify-center">
              <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                <QRCodeSVG
                  value={qrCodePayload}
                  size={168}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#0D9488] mt-3">
                MEDIQUEUE://{doctorInfo.roomNumber?.replace(/\s+/g, '-').toUpperCase() || 'ROOM-00'}/OPD
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Patients open the MediQueue Mobile App and tap <span className="font-bold text-slate-700">"Scan QR"</span> to load their records directly to {doctorInfo.name || 'the doctor'}'s monitor.
            </p>

            <button
              type="button"
              onClick={handleSimulateQRScan}
              className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-sm"
            >
              Simulate Scan Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}