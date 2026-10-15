require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const appointmentRoutes = require('./routes/appointmenthospitalRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const labRoutes = require('./routes/labRoutes');
const clinicalRoutes = require('./routes/clinicalRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// 1. Connect Database
connectDB();

// 2. Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static Folder for Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. API Routes

app.use('/auth', authRoutes);
app.use('/patient', patientRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/appointment', appointmentRoutes);
app.use('/doctor', doctorRoutes);
app.use('/admin', adminRoutes);
app.use('/clinic', clinicRoutes);
app.use('/pharmacy', pharmacyRoutes);
app.use('/lab', labRoutes);
app.use('/clinical', clinicalRoutes);

// Root Gateway - Animated Access Denied Page
app.get('/', (req, res) => {
  res.status(403).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>403 - Access Denied | MediQueue API Core</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body {
      background: radial-gradient(circle at 50% 30%, #13233c 0%, #080d18 100%);
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    /* Animated Grid Background */
    body::before {
      content: "";
      position: absolute;
      width: 200%;
      height: 200%;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      transform: perspective(600px) rotateX(60deg) translateY(-20%);
      animation: gridMove 20s linear infinite;
      z-index: 1;
    }

    @keyframes gridMove {
      0% { transform: perspective(600px) rotateX(60deg) translateY(0); }
      100% { transform: perspective(600px) rotateX(60deg) translateY(40px); }
    }

    .card {
      position: relative;
      z-index: 2;
      background: rgba(15, 27, 47, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(225, 29, 72, 0.3);
      box-shadow: 0 0 50px rgba(225, 29, 72, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      padding: 45px 35px;
      border-radius: 28px;
      text-align: center;
      max-width: 480px;
      width: 90%;
      animation: floatCard 4s ease-in-out infinite;
    }

    @keyframes floatCard {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }

    /* Pulsing Shield Icon */
    .icon-wrapper {
      width: 90px;
      height: 90px;
      margin: 0 auto 24px;
      background: rgba(225, 29, 72, 0.1);
      border: 2px solid rgba(225, 29, 72, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(225, 29, 72, 0.3);
      animation: pulseGlow 2.5s infinite;
    }

    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(225, 29, 72, 0.3); }
      50% { transform: scale(1.06); box-shadow: 0 0 35px rgba(225, 29, 72, 0.6); }
    }

    .icon-wrapper svg {
      width: 46px;
      height: 46px;
      fill: none;
      stroke: #f43f5e;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .badge {
      display: inline-block;
      padding: 4px 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      background: rgba(225, 29, 72, 0.15);
      color: #fb7185;
      border: 1px solid rgba(225, 29, 72, 0.4);
      border-radius: 9999px;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }

    p {
      color: #94a3b8;
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .status-box {
      background: rgba(2, 6, 23, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 12px 18px;
      font-size: 12px;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: monospace;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 10px #10b981;
      animation: livePulse 1.5s infinite;
    }

    @keyframes livePulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .brand-tag {
      margin-top: 20px;
      font-size: 11px;
      color: #475569;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <div class="card">
    <div class="icon-wrapper">
      <svg viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>

    <div class="badge">403 Restricted Access</div>
    <h1>Access Denied</h1>
    <p>
      Direct browser access to the MediQueue API endpoint is prohibited. 
      Only authorized client handshakes from official MediQueue platforms are accepted.
    </p>

    <div class="status-box">
      <span><span class="live-dot"></span> Core API Status: Active</span>
      <span style="color:#0ea5e9;">256-Bit Encrypted</span>
    </div>

    <div class="brand-tag">
      MediQueue National Health Grid • Ministry of Health
    </div>
  </div>

</body>
</html>
  `);
});

// 5. 404 Route Not Found Middleware (Optional)
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// 6. Custom Error Handler Middleware
app.use(errorHandler);

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;