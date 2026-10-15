import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Pill, FlaskConical, Building2, Plus, LogOut, Hospital, Building, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import { getAllHospitals } from '../APIservices/HospitalService';
import { createClinic, allashospitalClinics, updateClinic, deleteClinic } from '../APIservices/ClinicService';
import { doctorCreate, allDoctors, updateDoctor, deleteDoctor } from '../APIservices/DoctorService';
import { pharmacyCreate, allpharmacy, updatePharmacy, deletePharmacy } from '../APIservices/PharmacyService';
import { labCreate, allLabs, updateLab, deleteLab } from '../APIservices/LabService';
import { useToast } from '../components/ToastContext';

export default function ITSupportDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState('');
  const [clinics, setClinics] = useState([]);
  const [slmc, setSlmc] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [counter, setCounter] = useState('');
  const [staff, setStaff] = useState('');
  const [unit, setUnit] = useState('');
  const [sampleTypes, setSampleTypes] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [labs, setLabs] = useState([]);

  const [activeTab, setActiveTab] = useState('overview'); 
  const [modalType, setModalType] = useState(null); 
  const [editingItem, setEditingItem] = useState(null);
  const [itemStatus, setItemStatus] = useState('active');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const dashboardInitializedRef = useRef(false);

  useEffect(() => {
    if (dashboardInitializedRef.current) return;
    dashboardInitializedRef.current = true;
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      const [user, hospitalList] = await Promise.all([
        getUserProfile(),
        fetchHospitals(),
      ]);

      if (!user) return;

      if (!hospitalList || hospitalList.length === 0) {
        showToast('error', 'No hospitals found');
        return;
      }

      const assignedHospital = hospitalList.find(
        (hospital) =>
          hospital.assignedITLead?.trim().toLowerCase() ===
          user.email?.trim().toLowerCase()
      );

      if (!assignedHospital?._id) {
        setHospitalId('');
        showToast('error', 'No hospital is assigned to this IT officer');
        return;
      }

      const id = assignedHospital._id;
      setHospitalId(id);

      await Promise.all([
        getAllClinics(id),
        doctorAllList(id),
        labAllList(id),
        pharmacyAllList(id),
      ]);

    } catch (error) {
      showToast('error', 'Failed to initialize dashboard');
    }
  };

  const getUserProfile = () => {
    const storedUser = localStorage.getItem('adminUser');
    if (!storedUser) {
      navigate('/');
      return null;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const user = parsedUser.user || parsedUser;
      setCurrentUser(user);
      return user;
    } catch (err) {
      showToast('error', 'Invalid user session');
      return null;
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await getAllHospitals();
      if (res.ok && Array.isArray(res.data?.data)) {
        const hospitalList = res.data.data;
        setHospitals(hospitalList);
        return hospitalList;
      }
      return [];
    } catch (err) {
      showToast('error', 'Failed to fetch hospitals');
      return [];
    }
  };

  const doctorAllList = async (id) => {
    if (!id) return;
    try {
      const result = await allDoctors(id);
      if (result.ok) {
        const docArray = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data?.doctors)
          ? result.data.doctors
          : Array.isArray(result.data)
          ? result.data
          : [];
        setDoctors(docArray);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      setDoctors([]);
    }
  };

  const labAllList = async (id) => {
    if (!id) return;
    try {
      const result = await allLabs(id);
      if (result.ok) {
        const labArray = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data?.labs)
          ? result.data.labs
          : Array.isArray(result.data)
          ? result.data
          : [];
        setLabs(labArray);
      } else {
        setLabs([]);
      }
    } catch (err) {
      setLabs([]);
    }
  };

  const pharmacyAllList = async (id) => {
    if (!id) return;
    try {
      const result = await allpharmacy(id);
      if (result.ok) {
        const phArray = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data?.pharmacies)
          ? result.data.pharmacies
          : Array.isArray(result.data)
          ? result.data
          : [];
        setPharmacies(phArray);
      } else {
        setPharmacies([]);
      }
    } catch (err) {
      setPharmacies([]);
    }
  };

  const getAllClinics = async (id) => {
    if (!id) return;
    try {
      const res = await allashospitalClinics(id);
      if (res.ok && Array.isArray(res.data?.data)) {
        setClinics(res.data.data);
      } else if (res.ok && Array.isArray(res.data)) {
        setClinics(res.data);
      } else {
        setClinics([]);
      }
    } catch (err) {
      showToast('error', 'Failed to fetch clinics');
    }
  };

  const currentHospital = hospitals.find(
    (hospital) =>
      hospital.assignedITLead?.trim().toLowerCase() ===
      currentUser?.email?.trim().toLowerCase()
  );

  const getAssignedHospital = () => {
    return currentHospital ? currentHospital.name : 'Not Assigned';
  };

  const resetForms = () => {
    setEditingItem(null);
    setName('');
    setRoomNumber('');
    setServices([]);
    setTimeSlots([]);
    setSlmc('');
    setSpecialty('');
    setClinicId('');
    setCounter('');
    setStaff('');
    setUnit('');
    setSampleTypes('');
    setItemStatus('active');
    setModalType(null);
  };

  const openAddModal = (type) => {
    resetForms();
    setModalType(type);
    if (type === 'doctor') {
      setItemStatus('Available');
    } else {
      setItemStatus('active');
    }
  };

  const handleEditClinic = (cln) => {
    setEditingItem(cln);
    setName(cln.name || '');
    setRoomNumber(cln.roomNumber || '');
    setServices(Array.isArray(cln.services) ? cln.services.join(', ') : (cln.services || ''));
    setTimeSlots(Array.isArray(cln.timeSlots) ? cln.timeSlots.join(', ') : (cln.timeSlots || ''));
    setItemStatus(cln.status || 'active');
    setModalType('clinic');
  };

  const handleEditDoctor = (doc) => {
    setEditingItem(doc);
    setSlmc(doc.slmc || doc.adminId?.StaffID || '');
    setSpecialty(doc.specialty || '');
    const cId = typeof doc.clinicId === 'object' ? doc.clinicId?._id : doc.clinicId;
    setClinicId(cId || '');
    setItemStatus(doc.status || 'Available');
    setModalType('doctor');
  };

  const handleEditPharmacy = (ph) => {
    setEditingItem(ph);
    setCounter(ph.counter || '');
    setStaff(ph.staff || ph.adminId?.StaffID || '');
    setItemStatus(ph.status || 'active');
    setModalType('pharmacy');
  };

  const handleEditLab = (lb) => {
    setEditingItem(lb);
    setUnit(lb.unit || '');
    setStaff(lb.staff || lb.adminId?.StaffID || '');
    setSampleTypes(Array.isArray(lb.sampleTypes) ? lb.sampleTypes.join(', ') : (lb.sampleTypes || ''));
    setItemStatus(lb.status || 'active');
    setModalType('lab');
  };

  // Handlers for Add/Edit
  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!slmc || !clinicId) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (editingItem) {
        result = await updateDoctor(editingItem._id, slmc, specialty, clinicId, itemStatus);
      } else {
        result = await doctorCreate(slmc, specialty, hospitalId, clinicId);
      }

      if (result.ok) {
        showToast('success', editingItem ? 'Doctor updated successfully!' : 'Doctor registered successfully!');
        await doctorAllList(hospitalId);
        resetForms();
      } else {
        showToast('error', result.data?.message || 'Failed to save doctor.');
      }
    } catch (error) {
      showToast('error', 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClinic = async (e) => {
    e.preventDefault();
    if (!hospitalId) {
      showToast('error', 'Hospital ID is missing');
      return;
    }

    setLoading(true);
    try {
      const formattedServices = typeof services === 'string'
        ? services.split(',').map((s) => s.trim()).filter(Boolean)
        : services;

      const formattedTimeSlots = typeof timeSlots === 'string'
        ? timeSlots.split(',').map((t) => t.trim()).filter(Boolean)
        : timeSlots;

      let result;
      if (editingItem) {
        result = await updateClinic(editingItem._id, name, roomNumber, formattedServices, formattedTimeSlots, itemStatus);
      } else {
        result = await createClinic(hospitalId, name, roomNumber, formattedServices, formattedTimeSlots, itemStatus);
      }

      if (result.ok) {
        showToast('success', editingItem ? 'Clinic updated successfully!' : 'Clinic added successfully!');
        await getAllClinics(hospitalId);
        resetForms();
      } else {
        showToast('error', result.data?.message || 'Failed to save clinic.');
      }
    } catch (error) {
      showToast('error', 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePharmacy = async (e) => {
    e.preventDefault();
    if (!counter || !staff) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (editingItem) {
        result = await updatePharmacy(editingItem._id, counter, staff, itemStatus);
      } else {
        result = await pharmacyCreate(counter, staff, hospitalId);
      }

      if (result.ok) {
        showToast('success', editingItem ? 'Pharmacy updated successfully!' : 'Pharmacy registered successfully!');
        await pharmacyAllList(hospitalId);
        resetForms();
      } else {
        showToast('error', result.data?.message || 'Failed to save pharmacy.');
      }
    } catch (error) {
      showToast('error', 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLab = async (e) => {
    e.preventDefault();
    if (!unit || !staff) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const formattedSamples = typeof sampleTypes === 'string'
        ? sampleTypes.split(',').map((s) => s.trim()).filter(Boolean)
        : sampleTypes;

      let result;
      if (editingItem) {
        result = await updateLab(editingItem._id, unit, staff, formattedSamples, itemStatus);
      } else {
        result = await labCreate(unit, staff, formattedSamples, hospitalId);
      }

      if (result.ok) {
        showToast('success', editingItem ? 'Lab unit updated successfully!' : 'Lab registered successfully!');
        await labAllList(hospitalId);
        resetForms();
      } else {
        showToast('error', result.data?.message || 'Failed to save lab.');
      }
    } catch (error) {
      showToast('error', 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Confirmation Handler
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id, name } = deleteConfirm;
    setLoading(true);
    try {
      let result;
      if (type === 'clinic') {
        result = await deleteClinic(id);
        if (result.ok) {
          showToast('success', `Clinic "${name}" deleted successfully`);
          await getAllClinics(hospitalId);
        }
      } else if (type === 'doctor') {
        result = await deleteDoctor(id);
        if (result.ok) {
          showToast('success', `Doctor "${name}" deleted successfully`);
          await doctorAllList(hospitalId);
        }
      } else if (type === 'pharmacy') {
        result = await deletePharmacy(id);
        if (result.ok) {
          showToast('success', `Counter "${name}" deleted successfully`);
          await pharmacyAllList(hospitalId);
        }
      } else if (type === 'lab') {
        result = await deleteLab(id);
        if (result.ok) {
          showToast('success', `Lab unit "${name}" deleted successfully`);
          await labAllList(hospitalId);
        }
      }

      if (!result?.ok) {
        showToast('error', result?.data?.message || `Failed to delete ${type}`);
      }
    } catch (error) {
      showToast('error', 'Unable to connect to the server.');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#F4F7FB] font-sans antialiased overflow-hidden text-slate-800">

      
      <aside className="w-64 bg-[#0F1B2F] flex flex-col justify-between shrink-0 select-none text-slate-300 shadow-xl">
        <div>
          <div className="h-18 px-6 flex items-center gap-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-[#1E5BF0] flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">MediQueue</span>
              <span className="block text-[10px] text-blue-400 font-bold uppercase">Hospital IT Desk</span>
            </div>
          </div>

          <div className="p-4 mx-3 my-3 bg-white/[0.04] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 text-white text-xs font-bold">
              <Hospital className="w-4 h-4 text-emerald-400" />
              <span className="truncate">{getAssignedHospital()}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {currentUser?.email ? `Admin: ${currentUser.email}` : 'Hospital IT Desk'}
            </p>
          </div>

          <nav className="p-3 space-y-1.5">
            {[
              { id: 'overview', label: 'Facility Overview', icon: LayoutDashboard },
              { id: 'doctors', label: 'Doctors & Rooms', icon: Stethoscope, count: doctors.length },
              { id: 'clinics', label: 'Clinics & OPDs', icon: Building, count: clinics.length },
              { id: 'counters', label: 'Pharmacies & Labs', icon: Pill, count: pharmacies.length + labs.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
                    ? 'bg-[#1E5BF0] text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 leading-tight">
            <span className="font-bold block text-white mb-0.5">🔒 Multi-Hospital Note:</span>
            Hospital registrations are centrally governed by the Ministry of Health Super Admin.
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                IT
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">
                  {currentUser?.name || 'IT Support Officer'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {hospitalId ? `Node: ${hospitalId.slice(-6)}` : 'Local Administrator'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

     
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">MediQueue Local Node:</span>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
              Online • Real-Time Synchronization
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAddModal('doctor')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1E5BF0] border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Doctor
            </button>

            <button
              type="button"
              onClick={() => openAddModal('clinic')}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Clinic
            </button>

            <button
              type="button"
              onClick={() => openAddModal('pharmacy')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0B5338] border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Counter
            </button>

            <button
              type="button"
              onClick={() => openAddModal('lab')}
              className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-[#0F5A71] border border-cyan-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Lab Unit
            </button>
          </div>
        </header>

        <main className="p-8 max-w-[1600px] w-full mx-auto space-y-6 flex-1">

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Registered Doctors</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{doctors.length}</h3>
                <span className="text-[11px] text-emerald-600 font-bold">Consultation Staff</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E5BF0] flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Configured Clinics</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{clinics.length}</h3>
                <span className="text-[11px] text-purple-600 font-bold">Active OPD Services</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Pharmacy Counters</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{pharmacies.length}</h3>
                <span className="text-[11px] text-emerald-600 font-bold">Dispensaries</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0B5338] flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Diagnostic Units</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{labs.length}</h3>
                <span className="text-[11px] text-cyan-700 font-bold">Laboratory Stations</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0F5A71] flex items-center justify-center">
                <FlaskConical className="w-6 h-6" />
              </div>
            </div>
          </div>

         
          {(activeTab === 'overview' || activeTab === 'doctors') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Hospital Medical Officers & Room Assignments</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Assign consultation rooms for the doctor to receive QR scan connections.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openAddModal('doctor')}
                  className="px-3 py-1.5 bg-[#1E5BF0] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New Doctor
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-3">
                      <th className="pb-3">Doctor ID</th>
                      <th className="pb-3">SLMC Reg. No</th>
                      <th className="pb-3">Specialty</th>
                      <th className="pb-3">Assigned Clinic</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-400">
                          No doctors registered yet. Click "+ New Doctor" to register.
                        </td>
                      </tr>
                    ) : (
                      doctors.map((doc, idx) => (
                        <tr key={doc._id || doc.id || idx} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-slate-600">
                            {doc.id || (doc._id ? `DOC-${doc._id.slice(-4).toUpperCase()}` : `DOC-${idx + 1}`)}
                          </td>
                          <td className="py-3 font-mono font-bold text-blue-600">
                            {doc.slmc || doc.adminId?.StaffID || 'N/A'}
                          </td>
                          <td className="py-3 text-slate-700 font-medium">{doc.specialty || 'General Practitioner'}</td>
                          <td className="py-3 font-bold text-[#1E5BF0]">
                            {typeof doc.clinicId === 'object'
                              ? doc.clinicId?.name
                              : clinics.find((c) => c._id === doc.clinicId)?.name || 'General OPD'}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              ● {doc.status || 'Available'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditDoctor(doc)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Edit Doctor"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm({ type: 'doctor', id: doc._id, name: `Doctor (${doc.slmc || doc.adminId?.StaffID || 'Assigned'})` })}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Doctor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          
          {(activeTab === 'overview' || activeTab === 'clinics') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Configured Hospital Clinics (OPDs)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Clinics available for patient mobile token bookings.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openAddModal('clinic')}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New Clinic
                </button>
              </div>

              {clinics.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No clinics configured for this hospital yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {clinics.map((cln, idx) => (
                    <div key={cln._id || cln.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded font-bold">
                            {cln.roomNumber || 'Room N/A'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditClinic(cln)}
                              className="p-1 text-purple-600 hover:bg-purple-100 rounded-md transition cursor-pointer"
                              title="Edit Clinic"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm({ type: 'clinic', id: cln._id, name: cln.name })}
                              className="p-1 text-rose-500 hover:bg-rose-100 rounded-md transition cursor-pointer"
                              title="Delete Clinic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-2">{cln.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">Status: <span className="font-bold text-slate-700 capitalize">{cln.status || 'Active'}</span></p>

                        {cln.services && cln.services.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {cln.services.map((srv, sIdx) => (
                              <span key={sIdx} className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                                {srv}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                        <span className="text-slate-400">{cln.timeSlots?.length || 0} Slots</span>
                        <span className="text-emerald-600 font-bold">● Operational</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          
          {(activeTab === 'overview' || activeTab === 'counters') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Pharmacy Counters */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-[#0B5338]" /> Dispensary Counters
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Dispensary token release units</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddModal('pharmacy')}
                    className="px-2.5 py-1 bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    + Add Counter
                  </button>
                </div>

                <div className="space-y-3">
                  {pharmacies.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No pharmacy counters added yet.</p>
                  ) : (
                    pharmacies.map((ph, idx) => (
                      <div key={ph._id || ph.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-slate-900">{ph.counter}</h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Pharmacist: {ph.staff || ph.adminId?.name || ph.adminId?.StaffID || 'Assigned'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold px-2 py-0.5 rounded border text-[11px] ${
                            ph.status === 'inactive' ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          }`}>
                            {ph.status || 'Active'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEditPharmacy(ph)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
                            title="Edit Counter"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ type: 'pharmacy', id: ph._id, name: ph.counter })}
                            className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                            title="Delete Counter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

             
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-[#0F5A71]" /> Diagnostic Lab Units
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Specimen and MLT analysis desks</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddModal('lab')}
                    className="px-2.5 py-1 bg-[#0F5A71] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    + Add Lab Unit
                  </button>
                </div>

                <div className="space-y-3">
                  {labs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No lab units added yet.</p>
                  ) : (
                    labs.map((lb, idx) => (
                      <div key={lb._id || lb.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-slate-900">{lb.unit}</h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Technologist: {lb.staff || lb.adminId?.name || lb.adminId?.StaffID || 'Assigned'}
                          </p>
                          {lb.sampleTypes && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Samples: {Array.isArray(lb.sampleTypes) ? lb.sampleTypes.join(', ') : lb.sampleTypes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold px-2 py-0.5 rounded border text-[11px] ${
                            lb.status === 'inactive' ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-cyan-800 bg-cyan-50 border-cyan-200'
                          }`}>
                            {lb.status || 'Active'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEditLab(lb)}
                            className="p-1.5 text-cyan-700 hover:bg-cyan-100 rounded-lg transition cursor-pointer"
                            title="Edit Lab Unit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ type: 'lab', id: lb._id, name: lb.unit })}
                            className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                            title="Delete Lab Unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

     
      {modalType === 'doctor' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Edit Doctor Details' : 'Add New Doctor'}
              </h3>
              <button
                type="button"
                onClick={resetForms}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveDoctor} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">SLMC / Staff ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SLMC-59201"
                  value={slmc}
                  onChange={(e) => setSlmc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Specialty / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Consultant Physician"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Assigned Clinic *</label>
                <select
                  required
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="">Select Clinic</option>
                  {clinics.map((cln) => (
                    <option key={cln._id || cln.id} value={cln._id || cln.id}>
                      {cln.name} ({cln.roomNumber || 'OPD'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Status</label>
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="On-Leave">On-Leave</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForms}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#1E5BF0] text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingItem ? 'Update Doctor' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     
      {modalType === 'clinic' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Edit Clinic (OPD)' : 'Add New Clinic (OPD)'}
              </h3>
              <button
                type="button"
                onClick={resetForms}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveClinic} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Clinic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eye Clinic / Dermatology"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Allocated Consultation Rooms *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 04"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Available Services (Comma separated)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Vision Testing, Cataract Screening"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Consultation Time Slots (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 08:00 AM - 10:00 AM, 10:30 AM - 12:30 PM"
                  value={timeSlots}
                  onChange={(e) => setTimeSlots(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Status</label>
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForms}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving Clinic...' : editingItem ? 'Update Clinic' : 'Save Clinic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {modalType === 'pharmacy' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Edit Pharmacy Counter' : 'Add Pharmacy Counter'}
              </h3>
              <button
                type="button"
                onClick={resetForms}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSavePharmacy} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Counter Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter 04 - Special OPD"
                  value={counter}
                  onChange={(e) => setCounter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Assigned Pharmacist (Staff ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff ID"
                  value={staff}
                  onChange={(e) => setStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Status</label>
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForms}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving Counter...' : editingItem ? 'Update Counter' : 'Save Counter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {modalType === 'lab' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Edit Diagnostic Laboratory Unit' : 'Add Laboratory Unit'}
              </h3>
              <button
                type="button"
                onClick={resetForms}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveLab} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Lab Unit / Section Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hematology Section / Blood Bank"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Medical Laboratory Technologist (MLT Staff ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff ID"
                  value={staff}
                  onChange={(e) => setStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Sample Types (Comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blood, Urine, Saliva"
                  value={sampleTypes}
                  onChange={(e) => setSampleTypes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Status</label>
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForms}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#0F5A71] text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving Lab Unit...' : editingItem ? 'Update Lab Unit' : 'Save Lab Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Confirm Deletion</h3>
                <p className="text-[11px] text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteConfirm.name}"</span>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}