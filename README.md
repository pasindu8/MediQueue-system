# 🏥 MediQueue — Smart Hospital OPD Queue & Healthcare Management System

[![React Native](https://img.shields.io/badge/Mobile-React%20Native%20(Expo)-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://expo.dev/)
[![Electron](https://img.shields.io/badge/Desktop-Electron%20%2B%20React-191970?style=for-the-badge&logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**MediQueue** is an end-to-end digital Outpatient Department (OPD) queue management and hospital workflow ecosystem designed to eliminate overcrowding, streamline patient token generation, and connect hospital departments in real time.

The system consists of three integrated platforms:
1. **Patient Mobile App (`MediQueue`)**: Built with React Native (Expo) supporting English, Sinhala, and Tamil localization.
2. **Hospital Staff Desktop Portal (`adminMediQueue`)**: Cross-platform desktop application built with Electron, Vite, React, and Tailwind CSS for Doctors, Pharmacists, Lab Technicians, IT Support, and Super Admins.
3. **RESTful Backend API (`backend`)**: Powered by Node.js, Express, and MongoDB with SMS notifications, NIC validation, and file upload handling.

---

## ✨ Key Features

### 📱 Patient Mobile Application (`MediQueue`)
* **Multi-Language Support (i18n):** Full localization in **English (`en`)**, **Sinhala (`si`)**, and **Tamil (`ta`)** for accessible public healthcare usage.
* **Flexible Authentication:** Patient login and registration using **Sri Lankan NIC validation** or **Phone Number + OTP verification**.
* **OPD Appointment & Token Booking:** Select hospitals, clinics, and doctors to generate digital queue tokens (`NewToken`) with QR code check-in (`QrScan`).
* **Live Queue Tracking:** Real-time monitoring of active OPD queue status and estimated waiting turns.
* **Digital Pharmacy & Medical Records:** View digital prescriptions, pharmacy dispensing status, notifications, and manage personal health profile details.

### 🖥️ Hospital Staff Desktop Portal (`adminMediQueue`)
Role-based dashboards tailored for hospital operations:
* **Super Admin Dashboard:** Manage hospitals, clinics, system-wide configurations, and administrative accounts.
* **IT Support Dashboard:** Manage staff onboarding, doctor profiles, lab/pharmacy accounts, and technical configurations.
* **Doctor Dashboard:** Call next patient in queue, record consultations, issue digital prescriptions, and order laboratory tests.
* **Pharmacy Dashboard:** View incoming patient prescriptions in real time and update medication dispensing status.
* **Laboratory Dashboard:** Manage pending lab orders, process diagnostic tests, and upload/update patient lab reports.

### ⚙️ Backend API (`backend`)
* **Modular REST Architecture:** Dedicated routes and controllers for Authentication, Patients, Doctors, Clinics, Hospitals, Appointments, Clinical Consultations, Labs, and Pharmacies.
* **Automated SMS Notifications:** Integrated SMS service for OTP delivery and appointment/queue alerts.
* **Cloud Deployment Ready:** Configured with `vercel.json` for serverless deployment alongside MongoDB database integration.

---

## 🏗️ System Architecture & Folder Structure

```text
MediQueue-system/
├── MediQueue/                  # React Native (Expo) Patient Mobile App
│   ├── assets/                 # App icons, splash screens, and tab assets
│   └── src/
│       ├── app/                # Expo Router screens ((tabs), appointments, profile, auth)
│       ├── components/         # Reusable UI components & onboarding screens
│       ├── constants/          # Color palettes and theme definitions
│       ├── hooks/              # Custom theme and color-scheme hooks
│       ├── locales/            # i18n translation files (en.json, si.json, ta.json)
│       └── services/           # Axios API integration services
│
├── adminMediQueue/             # Electron + React Desktop Staff Portal
│   ├── resources/              # Desktop application icons
│   └── src/
│       ├── main/               # Electron main process
│       ├── preload/            # Electron preload scripts
│       └── renderer/src/       # React frontend (APIservices, components, role dashboards)
│
└── backend/                    # Node.js + Express + MongoDB REST API
    ├── config/                 # MongoDB database connection
    ├── controllers/            # Business logic for clinical, queue, and admin modules
    ├── middleware/             # JWT auth, async error handling, and Multer file uploads
    ├── models/                 # Mongoose schemas (User, PatientDetails, Doctor, Appointment, Consultation, LabOrder, Prescription, etc.)
    ├── routes/                 # Express API route definitions
    └── utils/                  # Sri Lankan NIC validator & SMS gateway service
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Local instance or MongoDB Atlas URI)
* **Expo Go** app on Android/iOS (for testing the mobile app)

---

### 1. Backend Setup (`backend`)

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SMS_API_KEY=your_sms_gateway_api_key
```

Start the backend server:
```bash
npm start
```

---

### 2. Patient Mobile App Setup (`MediQueue`)

```bash
cd MediQueue
npm install
```

Update the backend API base URL in `MediQueue/src/services/api.js` to match your local IP address or deployed server URL, then start Expo:
```bash
npx expo start
```
Scan the QR code using the **Expo Go** app on your mobile device.

---

### 3. Hospital Desktop Portal Setup (`adminMediQueue`)

```bash
cd adminMediQueue
npm install
```

Run the desktop application in development mode:
```bash
npm run dev
```

To build a standalone desktop executable (Windows/macOS/Linux):
```bash
npm run build:win   # For Windows
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile Frontend** | React Native, Expo Router, i18next (English, Sinhala, Tamil) |
| **Desktop Frontend** | Electron, React, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js, JWT Authentication, Multer |
| **Database** | MongoDB, Mongoose ODM |
| **Deployment & Tools** | Vercel, Electron Builder, ESLint, Prettier |

---

## 👨‍💻 Author

* **Pasindu Dulshan** — [@pasindu8](https://github.com/pasindu8)

---

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
