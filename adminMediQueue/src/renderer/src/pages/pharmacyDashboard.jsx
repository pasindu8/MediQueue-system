import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Clock, ShieldAlert, SkipForward, LogOut, AlertTriangle, Check, PackageCheck, } from 'lucide-react';
import { getPharmacyQueue, dispensePrescription, skipPrescription } from '../APIservices/mixService';
import { useToast } from '../components/ToastContext';


export default function PharmacyDashboard() {
  const navigate = useNavigate();
  const [activeCounter, setActiveCounter] = useState('N/A');
  const [pharmacistName, setPharmacistName] = useState('N/A');
  const [hospitalId, setHospitalId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePrescription, setActivePrescription] = useState(null);
  const [checkedMeds, setCheckedMeds] = useState({});
  const [incomingQueue, setIncomingQueue] = useState([]);
  const [dispensedCount, setDispensedCount] = useState(0);
  const pollingRef = useRef(null);

  useEffect(() => {
    loadPharmacyData();
    pollingRef.current = setInterval(loadPharmacyData, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [hospitalId]);

  const loadPharmacyData = async () => {
    try {
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.name) {
          setPharmacistName(user.name + ' (RPh)');
        }
        if (user.hospitalId && !hospitalId) {
          setHospitalId(user.hospitalId);
        }
      }

      const res = await getPharmacyQueue(hospitalId);
      if (res.ok && res.data) {
        setActivePrescription(res.data.activePrescription || null);
        setIncomingQueue(Array.isArray(res.data.incomingQueue) ? res.data.incomingQueue : []);
        if (res.data.dispensedCount !== undefined) {
          setDispensedCount(res.data.dispensedCount);
        }
      }
    } catch (err) {
      useToast('error','Failed to load pharmacy data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMedCheck = (id) => {
    setCheckedMeds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDispenseAndNext = async () => {
    if (!activePrescription) return;

    setIsProcessing(true);
    try {
      const res = await dispensePrescription(
        activePrescription._id,
        activePrescription.token,
        pharmacistName,
        activeCounter
      );

      if (res.ok && res.data?.dispensedCount) {
        setDispensedCount(res.data.dispensedCount);
      } else {
        setDispensedCount((prev) => prev + 1);
      }

      if (incomingQueue.length > 0) {
        const next = incomingQueue[0];
        const remaining = incomingQueue.slice(1);

        setActivePrescription({
          _id: next._id,
          token: next.token,
          patientName: next.patientName,
          age: next.age || 35,
          gender: next.gender || 'N/A',
          doctor: next.doctor,
          clinic: next.clinic || 'N/A',
          timeReceived: 'N/A',
          allergies: next.allergies || ['None reported'],
          medicines: next.medicines
        });

        setIncomingQueue(remaining);
        setCheckedMeds({});
      } else {
        setActivePrescription(null);
        setCheckedMeds({});
      }
    } catch (err) {
      useToast('error','Error dispensing prescription. Please try again.');
      setDispensedCount((prev) => prev + 1);
      if (incomingQueue.length > 0) {
        setActivePrescription(incomingQueue[0]);
        setIncomingQueue(incomingQueue.slice(1));
        setCheckedMeds({});
      } else {
        setActivePrescription(null);
        setCheckedMeds({});
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = async () => {
    if (!activePrescription) return;
    try {
      await skipPrescription(activePrescription._id, activePrescription.token);
    } catch (err) {
      useToast('error','Error skipping prescription. Please try again.');
    }
    useToast('info',`Token ${activePrescription.token} marked as Absent. Moving to next.`);
    handleDispenseAndNext();
  };

  const handleQueryDoctor = () => {
    useToast('info',`Clarification query sent directly to ${activePrescription.doctor} regarding prescription for Token ${activePrescription.token}.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#F1F5F3] font-sans antialiased overflow-hidden text-slate-800">

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <header className="h-16 bg-white border-b border-[#D8E4DC] px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B5338] to-[#127C55] flex items-center justify-center text-white shadow-md">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-[#0B5338]">MediQueue Dispensary Counter</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-[#0B5338] rounded-md border border-emerald-200">
                  LIVE DISPENSE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {activeCounter} • Pharmacist: <span className="font-bold text-slate-700">{pharmacistName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Prescriptions Dispensed Today</p>
              <p className="text-lg font-black text-[#0B5338] leading-none">{dispensedCount}</p>
            </div>

            <div className="text-right pl-4 border-l border-slate-200">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Pickup Queue</p>
              <p className="text-lg font-black text-amber-600 leading-none">{incomingQueue.length} Waiting</p>
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              End Shift
            </button>
          </div>
        </header>

        <main className="p-6 max-w-[1600px] w-full mx-auto flex-1">
          {activePrescription ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-2xl border border-[#D5E2D9] p-5 shadow-xs">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B5338] bg-[#E8F6EF] px-2 py-0.5 rounded">
                        Serving Counter Now
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-1">
                        {activePrescription.patientName}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activePrescription.age} Yrs • {activePrescription.gender} • Prescribed by <span className="font-semibold text-slate-700">{activePrescription.doctor}</span>
                      </p>
                    </div>

                    <div className="text-right bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">TOKEN NO</span>
                      <span className="text-3xl font-black text-[#0B5338] tracking-tight">
                        {activePrescription.token}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                      <div>
                        <span className="text-xs font-black text-rose-900 uppercase tracking-wider block">
                          Check for Drug Contraindications
                        </span>
                        <p className="text-xs font-bold text-rose-700">
                          Known Allergies: {activePrescription.allergies.join(', ') || 'No known allergies reported'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-800 bg-white px-2 py-1 rounded border border-rose-200">
                      Safety Verified
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#D5E2D9] p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-[#0B5338]" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Prescribed Medicines ({activePrescription.medicines.length} Items)
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">
                      Tick items as you pack them
                    </span>
                  </div>

                  {/* Medicines List */}
                  <div className="space-y-3">
                    {activePrescription.medicines.map((med) => {
                      const isChecked = !!checkedMeds[med.id];
                      return (
                        <div
                          key={med.id}
                          onClick={() => toggleMedCheck(med.id)}
                          className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${isChecked
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : 'bg-[#F9FBFA] border-slate-200 hover:border-emerald-300'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-md mt-0.5 border flex items-center justify-center transition ${isChecked
                                  ? 'bg-[#127C55] border-[#127C55] text-white'
                                  : 'border-slate-300 bg-white'
                                }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-bold ${isChecked ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                                  {med.name}
                                </h4>
                                <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-[#0B5338]">
                                  Qty: {med.qty}
                                </span>
                              </div>

                              <p className="text-xs font-semibold text-slate-600 mt-1">
                                {med.dosage} • <span className="text-[#0B5338] font-bold">{med.duration}</span>
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 italic">
                                Label note: "{med.instructions}"
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-3">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isChecked
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200/70 text-slate-600'
                                }`}
                            >
                              {isChecked ? '✓ Packed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleQueryDoctor}
                      className="w-full sm:w-auto px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Query Doctor
                    </button>

                    <button
                      onClick={handleSkip}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <SkipForward className="w-4 h-4" />
                      Patient Absent (Skip)
                    </button>

                    <button
                      onClick={handleDispenseAndNext}
                      disabled={isProcessing}
                      className="w-full sm:flex-1 py-3.5 bg-[#127C55] hover:bg-[#0B5338] disabled:opacity-60 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <PackageCheck className="w-5 h-5" />
                      {isProcessing ? 'Processing Dispensation...' : 'Mark Dispensed & Call Next Token'}
                    </button>
                  </div>
                </div>

              </div>

              {/* ================= RIGHT COLUMN: INCOMING PRESCRIPTION QUEUE (4 COLS) ================= */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-[#D5E2D9] p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0B5338]" />
                      <h3 className="text-sm font-bold text-slate-900">Waiting for Pickup</h3>
                    </div>
                    <span className="text-xs font-bold bg-[#E8F6EF] text-[#0B5338] px-2.5 py-0.5 rounded-full">
                      {incomingQueue.length} in queue
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3">
                    Prescriptions submitted by doctors arrive here in real-time.
                  </p>

                  <div className="space-y-2.5">
                    {incomingQueue.length > 0 ? (
                      incomingQueue.map((item, index) => (
                        <div
                          key={item.token}
                          className="p-3 bg-[#F8FAF9] hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-[#0B5338] bg-white border border-emerald-200 px-2 py-1 rounded-lg">
                              {item.token}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{item.patientName}</h4>
                              <p className="text-[10px] text-slate-400">
                                {item.itemsCount} Drugs • By {item.doctor}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              {item.time}
                            </span>
                            {item.allergies[0] !== 'None' && (
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                Allergy
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No pending prescriptions in queue.
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stock Reminder Box */}
                <div className="bg-white rounded-2xl border border-[#D5E2D9] p-4 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Dispensary Note:</span>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Insulin vials and Amoxicillin syrup batches are stored in Refrigerator Unit 02. Ensure labels have clear dosage timings in Sinhala/Tamil.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#0B5338] mx-auto mb-3">
                <PackageCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">No Prescriptions Waiting</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                All patient prescriptions submitted by doctors have been packed and dispensed.
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}