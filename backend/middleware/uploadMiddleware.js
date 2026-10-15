const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vercel Serverless පරිසරයේදී ලිවිය හැක්කේ /tmp ෆෝල්ඩරයට පමණි.
// Local පරිසරයේදී සාමාන්‍ය ../uploads/reports ෆෝල්ඩරය භාවිත වේ.
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'reports')
  : path.join(__dirname, '../uploads/reports');

// Ensure reports directory exists safely
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('Directory check warning:', err.message);
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (err) {
      console.warn('Destination folder warning:', err.message);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate clean, safe unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter for report documents and images
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type (${ext}). Please upload a PDF, DOC/DOCX, or PNG/JPEG image.`));
  }
};

const uploadReport = multer({
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB max
  },
  fileFilter: fileFilter,
});

module.exports = {
  uploadReport,
  uploadDir,
};