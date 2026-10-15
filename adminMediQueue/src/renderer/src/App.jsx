import React from 'react';
// 👈 HashRouter import කර එය Router නමින් හෝ කෙළින්ම HashRouter ලෙස භාවිත කරන්න
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage from './pages/home';
import DoctorDashboard from './pages/doctorDashboard';
import PharmacyDashboard from './pages/pharmacyDashboard';
import LabDashboard from './pages/labDashboard';
import ITSupportDashboard from './pages/iTSupportDashboard';
import SuperAdminDashboard from './pages/superAdminDashboard';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AdminLoginPage />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/pharmacy" element={<PharmacyDashboard />} />
        <Route path="/lab" element={<LabDashboard />} />
        <Route path="/it-support" element={<ITSupportDashboard />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}