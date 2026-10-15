import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Clock, AlertTriangle, LogOut, Microscope, Send, BellRing, FileCheck, Plus, RefreshCw, Sparkles, Trash2, X, Upload, Download, FileText, Eye, CheckCircle } from 'lucide-react';
import {
  getLabQueue,
  verifyAndPublishLabReport,
  createSampleLabOrder,
  uploadLabReportFile,
  getLabReportDownloadUrl,
  getReportFileStaticUrl
} from '../APIservices/mixService';
import { useToast } from '../components/ToastContext';


export default function LabDashboard() {
  const navigate = useNavigate();
  const [activeUnit, setActiveUnit] = useState('Central Diagnostic Lab - Phlebotomy');
  const [technologistName, setTechnologistName] = useState('Kasun Rathnayake (MLT)');
  const [hospitalId, setHospitalId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTest, setActiveTest] = useState(null);
  const activeTestIdRef = useRef(null);
  activeTestIdRef.current = activeTest?._id || activeTest?.token;

 
  const [isCriticalFlagged, setIsCriticalFlagged] = useState(false);
  const [criticalNote, setCriticalNote] = useState('');  
  const [incomingQueue, setIncomingQueue] = useState([]);
  const [recentCompletedOrders, setRecentCompletedOrders] = useState([]);
  const [queueTab, setQueueTab] = useState('pending'); 
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const [completedCount, setCompletedCount] = useState(0);
  const pollingRef = useRef(null);
  const [showAddParamModal, setShowAddParamModal] = useState(false);
  const [newParam, setNewParam] = useState({
    param: '',
    value: '',
    unit: '',
    refRange: '',
    isCritical: false,
  });

  useEffect(() => {
    loadLabData(true);
    pollingRef.current = setInterval(() => loadLabData(false), 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [hospitalId]);

  const loadLabData = async (isForced = false) => {
    try {
      const storedUser = localStorage.getItem('adminUser');
      let currentHospitalId = hospitalId;
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.name) {
            setTechnologistName(user.name);
          }
          if (user.hospitalId && !hospitalId) {
            setHospitalId(user.hospitalId);
            currentHospitalId = user.hospitalId;
          }
        } catch (e) {
          useToast('error', 'Failed to parse stored user data. Please log in again.');
        }
      }

      const res = await getLabQueue(currentHospitalId);
      if (res.ok && res.data) {
        if (res.data.completedCount !== undefined) {
          setCompletedCount(res.data.completedCount);
        }

        if (Array.isArray(res.data.recentCompletedOrders)) {
          setRecentCompletedOrders(res.data.recentCompletedOrders);
        }

        const serverActive = res.data.activeTest || null;
        const serverQueue = Array.isArray(res.data.incomingQueue) ? res.data.incomingQueue : [];
        const allOrders = [...(serverActive ? [serverActive] : []), ...serverQueue];

        setActiveTest((current) => {
          if (!current || isForced) {
            if (serverActive) {
              setIsCriticalFlagged(Boolean(serverActive.isCriticalFlagged));
              setCriticalNote(serverActive.criticalNote || '');
              if (serverActive.reportFile) {
                setAttachedFile({
                  url: serverActive.reportFile,
                  name: serverActive.reportFileName || 'Attached_Report.pdf',
                  size: serverActive.reportFileSize || '',
                  isAlreadyUploaded: true,
                });
              } else {
                setAttachedFile(null);
              }
            } else {
              setIsCriticalFlagged(false);
              setCriticalNote('');
              setAttachedFile(null);
            }
            return serverActive;
          }

          const currentId = current._id || current.token;
          const existsOnServer = allOrders.some((o) => (o._id || o.token) === currentId);

          if (!existsOnServer) {
            if (serverActive) {
              setIsCriticalFlagged(Boolean(serverActive.isCriticalFlagged));
              setCriticalNote(serverActive.criticalNote || '');
              if (serverActive.reportFile) {
                setAttachedFile({
                  url: serverActive.reportFile,
                  name: serverActive.reportFileName || 'Attached_Report.pdf',
                  size: serverActive.reportFileSize || '',
                  isAlreadyUploaded: true,
                });
              } else {
                setAttachedFile(null);
              }
            } else {
              setIsCriticalFlagged(false);
              setCriticalNote('');
              setAttachedFile(null);
            }
            return serverActive;
          }
          return current;
        });

        setIncomingQueue(() => {
          const activeId = activeTestIdRef.current || serverActive?._id || serverActive?.token;
          return allOrders.filter((o) => (o._id || o.token) !== activeId);
        });
      }
    } catch (err) {
      useToast('error', 'Failed to load lab queue data from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (id, newValue) => {
    setActiveTest((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        results: prev.results.map((r) => (r.id === id ? { ...r, value: newValue } : r)),
      };
    });
  };

  const handleSelectOrderFromQueue = (order) => {
    if (!order) return;
    setActiveTest({
      _id: order._id,
      token: order.token,
      patientName: order.patientName,
      age: order.age,
      gender: order.gender || 'N/A',
      doctor: order.doctor,
      clinic: order.clinic || 'N/A',
      sampleType: order.sampleType,
      timeCollected: order.timeCollected || 'N/A',
      testName: order.testName,
      priority: order.priority || 'N/A',
      results: Array.isArray(order.results) ? [...order.results] : [],
      isCriticalFlagged: Boolean(order.isCriticalFlagged),
      criticalNote: order.criticalNote || '',
      reportFile: order.reportFile || '',
      reportFileName: order.reportFileName || '',
      reportFileSize: order.reportFileSize || '',
    });
    setIsCriticalFlagged(Boolean(order.isCriticalFlagged));
    setCriticalNote(order.criticalNote || '');

    if (order.reportFile) {
      setAttachedFile({
        url: order.reportFile,
        name: order.reportFileName || 'Attached_Report.pdf',
        size: order.reportFileSize || '',
        isAlreadyUploaded: true,
      });
    } else {
      setAttachedFile(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIncomingQueue((prev) => {
      const remaining = prev.filter((o) => (o._id || o.token) !== (order._id || order.token));
      if (activeTest && (activeTest._id || activeTest.token) !== (order._id || order.token)) {
        return [activeTest, ...remaining];
      }
      return remaining;
    });
  };

  const handleAddParamSubmit = (e) => {
    e.preventDefault();
    if (!newParam.param.trim()) return;

    setActiveTest((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        results: [
          ...prev.results,
          {
            id: 'custom_' + Date.now(),
            param: newParam.param.trim(),
            value: newParam.value.trim(),
            unit: newParam.unit.trim() || 'Result',
            refRange: newParam.refRange.trim() || 'Normal',
            isCritical: Boolean(newParam.isCritical),
          },
        ],
      };
    });

    if (newParam.isCritical) {
      setIsCriticalFlagged(true);
      if (!criticalNote) {
        setCriticalNote(`Abnormal finding detected in ${newParam.param.trim()}`);
      }
    }

    setNewParam({ param: '', value: '', unit: '', refRange: '', isCritical: false });
    setShowAddParamModal(false);
  };

  const handleRemoveParam = (id) => {
    setActiveTest((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        results: prev.results.filter((r) => r.id !== id),
      };
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      useToast('error', 'File size exceeds 30MB limit. Please select a smaller file.');
      return;
    }

    setAttachedFile(file);

    if (activeTest?._id || activeTest?.token) {
      setIsUploadingFile(true);
      try {
        const uploadRes = await uploadLabReportFile(file, activeTest._id, activeTest.token);
        if (uploadRes.ok && uploadRes.data?.data) {
          const updated = uploadRes.data.data;
          setAttachedFile({
            url: updated.reportFile,
            name: updated.reportFileName || file.name,
            size: updated.reportFileSize || '',
            isAlreadyUploaded: true,
          });
          setActiveTest((prev) => (prev ? {
            ...prev,
            reportFile: updated.reportFile,
            reportFileName: updated.reportFileName,
            reportFileSize: updated.reportFileSize,
          } : prev));
        }
      } catch (err) {
        useToast('error', 'Failed to upload the report file. Please try again.');
      } finally {
        setIsUploadingFile(false);
      }
    }
  };

  const handleRemoveAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setActiveTest((prev) => (prev ? {
      ...prev,
      reportFile: '',
      reportFileName: '',
      reportFileSize: '',
    } : prev));
  };

  const handleVerifyAndPublish = async () => {
    if (!activeTest) return;

    setIsProcessing(true);
    try {
      const payload = {
        labOrderId: activeTest._id,
        token: activeTest.token,
        results: activeTest.results,
        isCriticalFlagged,
        criticalNote,
        technologistName,
        unit: activeUnit,
        status: 'verified',
        file: attachedFile instanceof File ? attachedFile : null,
        reportFile: attachedFile?.url || (typeof attachedFile === 'string' ? attachedFile : activeTest.reportFile || ''),
        reportFileName: attachedFile?.name || activeTest.reportFileName || '',
        reportFileSize: attachedFile?.size || activeTest.reportFileSize || '',
      };

      const res = await verifyAndPublishLabReport(payload);

      if (!res.ok) {
        useToast('error', 'Error saving report to backend server: ' + (res.data?.message || 'Server connection error'));
        return;
      }

      let alertMessage = `Report for Token ${activeTest.token} (${activeTest.patientName}) verified & published!\n`;
      alertMessage += `• Sent to ${activeTest.doctor}'s screen\n• Synced with Patient MediQueue App.`;

      if (attachedFile) {
        alertMessage += `\n• Official report file attached: ${attachedFile.name || 'Document uploaded'}`;
      }

      if (isCriticalFlagged) {
        alertMessage += `\n\n🚨 CRITICAL RED ALERT DISPATCHED TO DOCTOR:\n"${criticalNote || 'Abnormal critical findings detected'}"`;
      }

      useToast('success', alertMessage);
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (res.data?.completedCount !== undefined) {
        setCompletedCount(res.data.completedCount);
      } else {
        setCompletedCount((prev) => prev + 1);
      }

      await loadLabData(true);
    } catch (err) {
      useToast('error', 'Error saving report to backend server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSample = async () => {
    if (!activeTest) return;
    const confirmReject = window.confirm(
      `Reject specimen for Token ${activeTest.token} (${activeTest.patientName})?\nA recollection request will be transmitted to OPD Phlebotomy.`
    );
    if (!confirmReject) return;

    setIsProcessing(true);
    try {
      const payload = {
        labOrderId: activeTest._id,
        token: activeTest.token,
        technologistName,
        unit: activeUnit,
        status: 'cancelled',
        criticalNote: 'Specimen REJECTED: Hemolyzed/Clotted - Recollection requested',
      };

      const res = await verifyAndPublishLabReport(payload);
      if (res.ok) {
        useToast('success', `Specimen ${activeTest.token} marked as REJECTED. Request sent to OPD Phlebotomy.`);
      }

      if (incomingQueue.length > 0) {
        const next = incomingQueue[0];
        const remaining = incomingQueue.slice(1);
        setActiveTest(next);
        setIsCriticalFlagged(Boolean(next.isCriticalFlagged));
        setCriticalNote(next.criticalNote || '');
        setIncomingQueue(remaining);
      } else {
        setActiveTest(null);
        setIsCriticalFlagged(false);
        setCriticalNote('');
      }
    } catch (err) {
      useToast('error', 'Error communicating with server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateSample = async (testName = 'Full Blood Count (FBC)') => {
    setIsProcessing(true);
    try {
      const res = await createSampleLabOrder(hospitalId, testName);
      if (res.ok) {
        await loadLabData(true);
      } else {
        useToast('error', 'Could not simulate specimen: ' + (res.data?.message || 'Server error'));
      }
    } catch (err) {
      useToast('error', 'Error generating sample: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#F0F4F8] font-sans antialiased overflow-hidden text-slate-800">
    
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* 1. Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F5A71] to-[#0D9488] flex items-center justify-center text-white shadow-md">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-[#0F5A71]">MediQueue Diagnostic Laboratory</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-100 text-[#0F5A71] rounded-md border border-cyan-200">
                  MLT PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {activeUnit} • Medical Technologist: <span className="font-bold text-slate-700">{technologistName}</span>
              </p>
            </div>
          </div>

         
          <div className="flex items-center gap-4">
            <button
              onClick={() => loadLabData(true)}
              className="p-2 text-slate-500 hover:text-[#0F5A71] hover:bg-slate-100 rounded-xl transition"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Reports Released Today</p>
              <p className="text-lg font-black text-[#0F5A71] leading-none">{completedCount}</p>
            </div>

            <div className="text-right pl-4 border-l border-slate-200">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Pending Testing Queue</p>
              <p className="text-lg font-black text-amber-600 leading-none">{incomingQueue.length} Samples</p>
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              End Shift
            </button>
          </div>
        </header>

      
        <main className="p-6 max-w-[1600px] w-full mx-auto flex-1">
          {activeTest ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
              <div className="lg:col-span-8 space-y-4">
               
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F5A71] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                        Specimen Under Analysis
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-1">
                        {activeTest.patientName}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeTest.age} Yrs • {activeTest.gender} • Ordered by{' '}
                        <span className="font-bold text-slate-700">{activeTest.doctor}</span> ({activeTest.clinic})
                      </p>
                    </div>

                    <div className="text-right bg-cyan-50 px-4 py-2 rounded-2xl border border-cyan-200">
                      <span className="text-[10px] font-bold text-cyan-900 uppercase block">LAB TOKEN</span>
                      <span className="text-3xl font-black text-[#0F5A71] tracking-tight">
                        {activeTest.token}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-600">
                      Assay: <span className="font-bold text-slate-900">{activeTest.testName}</span>
                    </span>
                    <span className="text-slate-400">
                      Sample: <span className="font-medium text-slate-700">{activeTest.sampleType}</span> ({activeTest.timeCollected})
                    </span>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isCriticalFlagged
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isCriticalFlagged ? 'bg-rose-600 text-white animate-bounce' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <BellRing className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                          Immediate Doctor Critical Panic Alert
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Turn ON to sound an immediate visual/audio emergency pop-up on the doctor's screen upon report release.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCriticalFlagged(!isCriticalFlagged)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isCriticalFlagged
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isCriticalFlagged ? '🚨 ALERT ON' : 'Alert Off'}
                    </button>
                  </div>

                  {isCriticalFlagged && (
                    <div className="mt-3 pt-3 border-t border-rose-200">
                      <label className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
                        Critical Observation Note for Doctor:
                      </label>
                      <input
                        type="text"
                        value={criticalNote}
                        onChange={(e) => setCriticalNote(e.target.value)}
                        placeholder="e.g. Critical Platelet Drop (<30k). Immediate admission recommended."
                        className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  )}
                </div>

              
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Microscope className="w-4 h-4 text-[#0F5A71]" />
                      <h3 className="text-sm font-bold text-slate-900">Investigation Parameters & Findings</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddParamModal(true)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#0F5A71] bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Parameter
                      </button>
                      <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                        Type values directly from analyzer printout
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeTest.results && activeTest.results.length > 0 ? (
                      activeTest.results.map((param) => (
                        <div
                          key={param.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            param.isCritical ? 'bg-rose-50/50 border-rose-200' : 'bg-[#F9FBFA] border-slate-200'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{param.param}</span>
                              {param.isCritical && (
                                <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                                  ABNORMAL
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              Biological Ref Range: {param.refRange} {param.unit !== 'Result' && param.unit}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={param.value}
                              onChange={(e) => handleResultChange(param.id, e.target.value)}
                              placeholder="Value..."
                              className={`w-36 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-center border focus:outline-none transition ${
                                param.isCritical
                                  ? 'bg-white border-rose-400 text-rose-900 ring-1 ring-rose-200'
                                  : 'bg-white border-slate-300 text-slate-800 focus:border-[#0F5A71]'
                              }`}
                            />
                            <span className="text-xs font-mono font-semibold text-slate-500 w-16 text-left">
                              {param.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveParam(param.id)}
                              className="text-slate-300 hover:text-rose-500 p-1 rounded transition"
                              title="Remove parameter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No parameters defined for this test. Click "+ Add Parameter" above to record findings.
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0F5A71]" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Attach Official Report Document
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        PDF • PNG • JPG • DOCX (Max 30MB)
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      className="hidden"
                    />

                    {!attachedFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#0F5A71] bg-slate-50/70 hover:bg-cyan-50/30 rounded-xl p-4 text-center cursor-pointer transition group"
                      >
                        <div className="w-9 h-9 rounded-full bg-cyan-100 text-[#0F5A71] flex items-center justify-center mx-auto mb-1.5 group-hover:scale-105 transition">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 group-hover:text-[#0F5A71]">
                          Click to browse or drop diagnostic report document
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Uploaded report will be immediately downloadable by Doctor and Patient
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-cyan-50/80 border border-cyan-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#0F5A71] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {attachedFile.name}
                              </p>
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                {attachedFile.isAlreadyUploaded ? 'Attached' : 'Selected'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {attachedFile.size ? `Size: ${attachedFile.size} • ` : ''}
                              {isUploadingFile ? 'Uploading to server...' : 'Synced for Doctor & Patient Download'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {attachedFile.url && (
                            <>
                              <a
                                href={getReportFileStaticUrl(attachedFile.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 text-[#0F5A71] hover:bg-cyan-100 border border-cyan-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                                title="View Document in New Tab"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">View</span>
                              </a>
                              <a
                                href={getLabReportDownloadUrl(activeTest._id || activeTest.token)}
                                download
                                className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                                title="Download Report"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Download</span>
                              </a>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveAttachedFile}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove attached file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRejectSample}
                      disabled={isProcessing}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Reject Specimen (Clotted/Recollect)
                    </button>

                    <button
                      type="button"
                      onClick={handleVerifyAndPublish}
                      disabled={isProcessing}
                      className="w-full sm:flex-1 py-3.5 bg-[#0F5A71] hover:bg-[#0c485a] disabled:opacity-60 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      {isProcessing ? 'Verifying & Releasing Report...' : 'Verify & Release Report to Doctor & Patient App'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-3">
                    <button
                      type="button"
                      onClick={() => setQueueTab('pending')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        queueTab === 'pending'
                          ? 'bg-white text-[#0F5A71] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Pending ({incomingQueue.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQueueTab('completed')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        queueTab === 'completed'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed ({recentCompletedOrders.length})
                    </button>
                  </div>

                  {queueTab === 'pending' ? (
                    <div>
                      <p className="text-[11px] text-slate-400 mb-2.5">
                        Click any specimen to load it into analysis workspace:
                      </p>

                      <div className="space-y-2 max-h-[480px] overflow-y-auto">
                        {incomingQueue.length > 0 ? (
                          incomingQueue.map((item) => (
                            <div
                              key={item._id || item.token}
                              onClick={() => handleSelectOrderFromQueue(item)}
                              className="p-3 bg-[#F8FAF9] hover:bg-cyan-50/50 hover:border-cyan-300 border border-slate-200 rounded-xl flex items-center justify-between transition cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-[#0F5A71] bg-white border border-cyan-200 px-2 py-1 rounded-lg group-hover:bg-[#0F5A71] group-hover:text-white transition">
                                  {item.token}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800">{item.patientName}</h4>
                                  <p className="text-[10px] text-slate-500 font-semibold">{item.testName}</p>
                                  <p className="text-[9px] text-slate-400">By {item.doctor}</p>
                                </div>
                              </div>

                              <div className="text-right">
                                {item.reportFile ? (
                                  <span className="text-[9px] font-bold text-cyan-800 bg-cyan-100 px-1.5 py-0.5 rounded block mb-1">
                                    Has Report
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 block mb-1">
                                    {item.timeCollected || 'Pending'}
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    item.priority?.includes('High') || item.priority?.includes('STAT')
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {item.priority || 'Routine'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No pending laboratory tests in queue.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px] text-slate-400 mb-2.5">
                        Recently verified and released reports:
                      </p>

                      <div className="space-y-2 max-h-[480px] overflow-y-auto">
                        {recentCompletedOrders.length > 0 ? (
                          recentCompletedOrders.map((item) => (
                            <div
                              key={item._id || item.token}
                              className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-[#0F5A71]">
                                    {item.token}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-800 truncate">
                                    {item.patientName}
                                  </h4>
                                </div>
                                <p className="text-[10px] text-slate-500 truncate">{item.testName}</p>
                                <p className="text-[9px] text-emerald-700 font-semibold">
                                  Verified by {item.verifiedBy || 'MLT'}
                                </p>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.5">
                                {item.reportFile ? (
                                  <a
                                    href={getLabReportDownloadUrl(item._id || item.token)}
                                    download
                                    className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1 shadow-xs transition"
                                    title="Download Published Report"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium italic">
                                    Digital values only
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No completed reports released today yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Simulate Incoming Specimen:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSimulateSample('Full Blood Count (FBC)')}
                        disabled={isProcessing}
                        className="px-2 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition"
                      >
                        + FBC Panel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateSample('Dengue NS1 Antigen Rapid')}
                        disabled={isProcessing}
                        className="px-2 py-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-center transition"
                      >
                        + Dengue STAT
                      </button>
                    </div>
                  </div>
                </div>

               
                <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Lab Quality Control Note:</span>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Internal QC calibrations verified. Uploaded report documents are permanently archived and instantly synced across the Doctor OPD Desk and MediQueue Mobile App.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            
            <div className="py-20 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0F5A71] mx-auto mb-4 shadow-sm">
                <FileCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">All Lab Orders Completed</h2>
              <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
                No active specimens in queue. As doctors order diagnostic investigations from OPD consultation rooms, they will appear here live.
              </p>

             
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-left">
                <span className="text-xs font-bold text-[#0F5A71] flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Testing & Demo Specimen Dispatch:
                </span>
                <p className="text-[11px] text-slate-500 mb-3">
                  Click a test below to generate a live laboratory specimen order and test findings verification:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateSample('Full Blood Count (FBC)')}
                    disabled={isProcessing}
                    className="px-3 py-2 bg-[#0F5A71] hover:bg-[#0c485a] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    + Routine FBC Specimen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateSample('Dengue NS1 Antigen Rapid')}
                    disabled={isProcessing}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    + Dengue NS1 STAT (Critical)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateSample('Fasting Blood Sugar (FBS)')}
                    disabled={isProcessing}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    + Fasting Blood Sugar
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

     
      {showAddParamModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0F5A71]" />
                Add Investigation Parameter
              </h3>
              <button
                type="button"
                onClick={() => setShowAddParamModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddParamSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Parameter Name *
                </label>
                <input
                  type="text"
                  required
                  value={newParam.param}
                  onChange={(e) => setNewParam({ ...newParam, param: e.target.value })}
                  placeholder="e.g. Neutrophils %, Serum Potassium"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F5A71]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={newParam.value}
                    onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
                    placeholder="e.g. 65"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F5A71]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newParam.unit}
                    onChange={(e) => setNewParam({ ...newParam, unit: e.target.value })}
                    placeholder="e.g. %, mmol/L"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F5A71]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Reference Range
                </label>
                <input
                  type="text"
                  value={newParam.refRange}
                  onChange={(e) => setNewParam({ ...newParam, refRange: e.target.value })}
                  placeholder="e.g. 40 - 75 %"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F5A71]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="paramIsCritical"
                  checked={newParam.isCritical}
                  onChange={(e) => setNewParam({ ...newParam, isCritical: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="paramIsCritical" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Mark as Abnormal / Critical finding
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddParamModal(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F5A71] hover:bg-[#0c485a] text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Add Parameter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}