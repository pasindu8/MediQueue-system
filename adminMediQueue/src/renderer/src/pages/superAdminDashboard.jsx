import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, Building2, ShieldCheck, Plus, Search, LogOut, Server, Globe, UserCheck, KeyRound, } from 'lucide-react';
import { createHospital, getAllHospitals } from '../APIservices/HospitalService';
import { registerAssigned, registerOfficer, allOfficer } from '../APIservices/authService';
import { allClinics } from '../APIservices/ClinicService';
import { useToast } from '../components/ToastContext';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();


  const [activeTab, setActiveTab] = useState('hospitals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [ofname, setOfname] = useState('');
  const [StaffID, setStaffID] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [itOfficers, setItOfficers] = useState([]);
  const [clinics, setClinics] = useState([]);

  const SRI_LANKA_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
    'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
    'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
    'Trincomalee', 'Vavuniya'
  ];

  const HOSPITAL_CATEGORIES = [
    'National Hospital', 'Specialized Hospital', 'Teaching Hospital', 'Provincial General Hospital',
    'District General Hospital', 'Base Hospital Type A', 'Base Hospital Type B', 'Divisional Hospital Type A',
    'Divisional Hospital Type B', 'Divisional Hospital Type C', 'Primary Medical Care Unit'
  ];

 
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    staffId: '',
    email: '',
    password: '',
    hospital: ''
  });


  const handleRegisterHospital = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const result = await createHospital(name, district, category, adminEmail);
      if (result.ok) {

        const result1 = await registerAssigned(adminEmail, adminPassword)

        if (result1.ok) {
          showToast('success', 'Hospital registered successfully!');


        } else {
          showToast('error', 'Failed to register assigned admin. Please try again.');
        }

      } else {
        showToast('error', 'Failed to create hospital. Please try again.');
      }
    } catch (error) {
      showToast('error', 'Unable to connect to the server.');
    } finally {
      setLoading(false);
      setShowAddHospitalModal(false);
      setName('');
      setCategory('');
      setDistrict('');
      setAdminEmail('');
      setAdminPassword('');
    }

  };

  
  const handleRegisterOfficerOnly = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const result = await registerOfficer(ofname, StaffID, email, phoneNumber, password);
      if (result.ok) {

        showToast('success', 'Officer registered successfully!');
      } else {
        showToast('error', 'Failed to register officer. Please try again.');
      }
    } catch (error) {
      showToast('error', 'Unable to connect to the server.');
    } finally {
      setLoading(false);
      setShowAddOfficerModal(false);
      setOfname('');
      setStaffID('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
    }

  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  // Filter with safe checks
  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name?.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    hospital.district?.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    hospital.category?.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getAllHospitals();

        if (res.ok && res.data.success) {
          setHospitals(res.data.data);
          const officersRes = await allOfficer();

          if (officersRes.ok && officersRes.data.success) {
            setItOfficers(officersRes.data.data);
          } else {
            showToast('error', 'Failed to fetch IT officers');
          }
        } else {
          showToast('error', 'Failed to fetch hospitals');
        }

        
        try {
          const clinicsRes = await allClinics();
          if (clinicsRes.ok && clinicsRes.data?.success) {
            setClinics(clinicsRes.data.data || []);
          }
        } catch (clinicErr) {
          showToast('error', 'Failed to fetch clinics data');
        }
      } catch (err) {
        showToast('error', 'Failed to fetch dashboard data');
      }
    };

    fetchDashboardData();
  }, []);

  const getAssignedHospital = (officerEmail) => {
    if (!officerEmail || !hospitals.length) return 'Not Assigned';

    const matchedHospital = hospitals.find(
      (hosp) => {
        return hosp.assignedITLead === officerEmail;
      }
    );
    return matchedHospital ? matchedHospital.name : 'Not Assigned';
  };

  const getClinicsCount = (hospitalId) => {
    if (!hospitalId) return 0;

    
    if (clinics.length > 0) {
      const matchCount = clinics.filter(
        (c) => String(c.hospitalId) === String(hospitalId)
      ).length;
      if (matchCount > 0) return matchCount;
    }

   
    const hospital = hospitals.find((hosp) => String(hosp._id) === String(hospitalId));
    return hospital ? hospital.activeClinics || 0 : 0;
  };

  const totalConfiguredClinics = clinics.length > 0
    ? clinics.length
    : hospitals.reduce((acc, h) => acc + (h.activeClinics || 0), 0);

  return (
    <div className="flex h-screen bg-[#0B1329] font-sans antialiased overflow-hidden text-slate-100">

     
      <aside className="w-64 bg-[#0B1120] flex flex-col justify-between shrink-0 select-none text-slate-400 border-r border-slate-800 z-30">
        <div>
          <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">MediQueue</span>
              <span className="block text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                Ministry of Health
              </span>
            </div>
          </div>

          <div className="p-4 mx-4 my-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-white text-xs font-bold">
              <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>National Health Grid</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Super Authority Access</p>
          </div>

          <nav className="p-3 space-y-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('hospitals')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${activeTab === 'hospitals'
                ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30'
                : 'hover:text-white hover:bg-slate-800/60'
                }`}
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <Hospital className="w-4 h-4" />
                <span>Hospital Network</span>
              </div>
              <span className="font-mono bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
                {hospitals.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admins')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${activeTab === 'admins'
                ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30'
                : 'hover:text-white hover:bg-slate-800/60'
                }`}
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <UserCheck className="w-4 h-4" />
                <span>Hospital IT Officers</span>
              </div>
              <span className="font-mono bg-white/10 text-slate-400 text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
                {itOfficers.length}
              </span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-black/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                MOH
              </div>
              <div>
                <p className="text-xs font-bold text-white">Super Admin</p>
                <p className="text-[10px] text-slate-400">Health Ministry</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

     
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

       
        <header className="h-18 bg-[#0F172A]/90 border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-300">Central MediQueue Core:</span>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
              National Health Grid Active • All Systems Operational
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'admins' ? (
              <button
                type="button"
                onClick={() => setShowAddOfficerModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add IT Officer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddHospitalModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Onboard New Hospital
              </button>
            )}
          </div>
        </header>

       
        <main className="p-8 max-w-[1700px] w-full mx-auto space-y-6 flex-1">

         
          {activeTab === 'hospitals' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  National Hospital Grid Directory
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage registered government hospitals, OPD capacities, and central connectivity.
                </p>
              </div>

             
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Total Onboarded Hospitals</p>
                    <h3 className="text-3xl font-black text-white mt-1">{hospitals.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Hospital className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Total Configured OPDs</p>
                    <h3 className="text-3xl font-black text-cyan-400 mt-1">
                      {totalConfiguredClinics} Clinics
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Active Online Nodes</p>
                    <h3 className="text-3xl font-black text-emerald-400 mt-1">
                      {hospitals.length} / {hospitals.length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Server className="w-6 h-6" />
                  </div>
                </div>
              </div>

             
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white">Registered Institutions</h2>

                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search hospital or district..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="All">All Districts</option>
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 pb-3">
                        <th className="pb-3">Institution Name</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">District</th>
                        <th className="pb-3">Configured OPDs</th>
                        <th className="pb-3">Assigned IT Lead</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredHospitals.map((hosp) => (
                        <tr key={hosp._id} className="hover:bg-slate-800/40">
                          <td className="py-4 font-bold text-white">{hosp.name}</td>
                          <td className="py-4 text-slate-300">{hosp.category}</td>
                          <td className="py-4 text-slate-300">{hosp.district}</td>
                          <td className="py-4 font-semibold text-slate-200">
                            {getClinicsCount(hosp._id)}
                          </td>
                          <td className="py-4 font-mono text-slate-400">{hosp.assignedITLead}</td>
                          <td className="py-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ● Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

         
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Hospital Local IT Officers Directory
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Primary IT Support officers responsible for Clinic rooms, Doctors, and Pharmacy counters.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white">Authorized Administrators</h2>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
                    {itOfficers.length} Officers Deployed
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 pb-3">
                        <th className="pb-3">Staff / Admin ID</th>
                        <th className="pb-3">Officer Name</th>
                        <th className="pb-3">Assigned Hospital</th>
                        <th className="pb-3">Official Email</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {itOfficers.map((officer) => (
                        <tr key={officer.id} className="hover:bg-slate-800/40">
                          <td className="py-4 font-mono font-bold text-blue-400">{officer.StaffID}</td>
                          <td className="py-4 font-bold text-white">{officer.name}</td>
                          <td className="py-4 font-semibold text-slate-300">
                            {getAssignedHospital(officer.email)}
                          </td>
                          <td className="py-4 font-mono text-slate-400">{officer.email}</td>
                          <td className="py-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ● {officer.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              type="button"
                              onClick={() => showToast('success', `Reset link sent to ${officer.email}`)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                              Reset Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    
      {showAddHospitalModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Hospital className="w-5 h-5 text-blue-400" />
                Onboard Government Hospital
              </h3>
              <button
                type="button"
                onClick={() => setShowAddHospitalModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterHospital} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Hospital Official Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Teaching Hospital Peradeniya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Facility Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {HOSPITAL_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">District Location *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {SRI_LANKA_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

             
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                  Assign Local IT Support Admin (Optional)
                </span>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Official IT Email</label>
                    <input
                      type="email"
                      placeholder="it.admin@health.gov.lk"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Admin Password</label>
                    <input
                      type="password"
                      placeholder="Temporary password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHospitalModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Provisioning...' : 'Confirm & Provision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     
      {showAddOfficerModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                Register Local IT Officer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddOfficerModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterOfficerOnly} className="space-y-3.5 text-xs">
              ofname, StaffID, email, phoneNumber, password
              <div>
                <label className="font-bold text-slate-300 block mb-1">Officer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Kalhara"
                  value={ofname}
                  onChange={(e) => setOfname(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Staff ID / NIC *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STF-9021 or 199012345678"
                  value={StaffID}
                  onChange={(e) => setStaffID(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +94 77 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Assigned Hospital</label>
                <select
                  value={newOfficer.hospital}
                  onChange={(e) => setNewOfficer({ ...newOfficer, hospital: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((hosp, idx) => (
                    <option key={hosp._id || hosp.name || idx} value={hosp.name}>
                      {hosp.name}
                    </option>
                  ))}
                </select>

              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="it.officer@health.gov.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Master Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Password for initial login"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}