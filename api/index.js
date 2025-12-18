const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const app = express();

// Session configuration for Vercel (using MemoryStore)
app.use(session({
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'time-academy-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  name: 'timeacademy.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get paths (works in both local and Vercel)
function getBasePath() {
  // In Vercel, static files are in /var/task (root of deployment)
  // __dirname points to /var/task/api, so we go up one level
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    // Try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '..'),           // /var/task
      path.join(process.cwd()),             // Current working directory
      '/var/task'                           // Direct path
    ];
    
    // Return the first path that exists or the first one as fallback
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return possiblePaths[0]; // Fallback to first
  }
  return __dirname;
}

const basePath = getBasePath();
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

// IMPORTANT: In Vercel, we should NOT serve static files through serverless function
// Let Vercel handle static files automatically
// Only handle API routes and admin.html

// For root path, redirect to index.html (Vercel will serve it)
app.get('/', (req, res) => {
  // In Vercel, let Vercel serve the static file
  // We just redirect or let it pass through
  if (isVercel) {
    // Try to serve if file exists, otherwise let Vercel handle it
    const indexPath = path.join(basePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // If file doesn't exist in expected location, 
      // Vercel should handle it automatically via static file serving
      res.redirect('/index.html');
    }
  } else {
    // Local development - serve the file
    const indexPath = path.join(basePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('index.html not found');
    }
  }
});

// Protect admin.html
app.get('/admin.html', (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return res.sendFile(path.join(basePath, 'admin.html'));
  } else {
    return res.redirect('/index.html?login=required');
  }
});

// Serve static files
if (!isVercel) {
  // Local development - serve all static files
  app.use(express.static(basePath, {
    index: ['index.html']
  }));
  app.use('/pdf', express.static(path.join(basePath, 'pdf')));
} else {
  // In Vercel, serve all static files through serverless function
  app.use('/pdf', express.static(path.join(basePath, 'pdf')));
  
  // Serve other static files (CSS, JS, images, fonts)
  app.use(express.static(basePath, {
    index: false, // We handle index.html explicitly above
    dotfiles: 'ignore'
  }));
}

// Authentication credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'davian';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'timeacademy';

// Helper function to verify password
async function verifyPassword(password) {
  try {
    return password === ADMIN_PASSWORD;
  } catch (error) {
    return false;
  }
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please login first.' });
}

// Configure multer for file uploads
// IMPORTANT: In Vercel, files uploaded to /tmp are temporary and will be deleted
// For production, you should use Vercel Blob Storage or other cloud storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
    const uploadPath = isVercel 
      ? '/tmp/pdf' // Vercel temporary directory (temporary only!)
      : path.join(basePath, 'pdf'); // Local development
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const filename = req.body.filename || file.originalname;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PDF yang diizinkan!'));
    }
  }
});

// Helper function to read materials
function getMaterials() {
  try {
    const materialsPath = path.join(basePath, 'materials.json');
    const data = fs.readFileSync(materialsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to save materials
function saveMaterials(materials) {
  const materialsPath = path.join(basePath, 'materials.json');
  fs.writeFileSync(
    materialsPath,
    JSON.stringify(materials, null, 2),
    'utf8'
  );
}

// API Routes

// GET all materials
app.get('/api/materials', (req, res) => {
  try {
    const materials = getMaterials();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membaca data materi' });
  }
});

// GET single material
app.get('/api/materials/:id', (req, res) => {
  try {
    const materials = getMaterials();
    const material = materials.find(m => m.id === parseInt(req.params.id));
    if (!material) {
      return res.status(404).json({ error: 'Materi tidak ditemukan' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membaca data materi' });
  }
});

// Authentication routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const trimmedUsername = username ? username.trim() : '';
    
    if (!trimmedUsername || !password) {
      return res.status(400).json({ success: false, error: 'Username dan password harus diisi' });
    }
    
    if (trimmedUsername === ADMIN_USERNAME) {
      const isValid = await verifyPassword(password);
      if (isValid) {
        req.session.isAuthenticated = true;
        req.session.username = trimmedUsername;
        return res.json({ success: true, message: 'Login berhasil' });
      }
    }
    
    res.status(401).json({ success: false, error: 'Username atau password salah' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Gagal melakukan login' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal logout' });
    }
    res.json({ success: true, message: 'Logout berhasil' });
  });
});

app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

// POST create new material
app.post('/api/materials', requireAuth, (req, res) => {
  try {
    const materials = getMaterials();
    const newMaterial = {
      id: materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1,
      title: req.body.title,
      subtitle: req.body.subtitle,
      pdfFile: req.body.pdfFile || null,
      isAvailable: req.body.isAvailable || false,
      availableDate: req.body.availableDate || null
    };
    materials.push(newMaterial);
    saveMaterials(materials);
    res.status(201).json(newMaterial);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat materi baru' });
  }
});

// PUT update material
app.put('/api/materials/:id', requireAuth, (req, res) => {
  try {
    const materials = getMaterials();
    const index = materials.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Materi tidak ditemukan' });
    }
    
    materials[index] = {
      ...materials[index],
      ...req.body,
      id: materials[index].id
    };
    
    saveMaterials(materials);
    res.json(materials[index]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui materi' });
  }
});

// DELETE material
app.delete('/api/materials/:id', requireAuth, (req, res) => {
  try {
    const materials = getMaterials();
    const index = materials.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Materi tidak ditemukan' });
    }
    
    const material = materials[index];
    
    // Optionally delete PDF file
    if (material.pdfFile && req.query.deleteFile === 'true') {
      const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
      const pdfPath = isVercel
        ? path.join('/tmp/pdf', material.pdfFile)
        : path.join(basePath, 'pdf', material.pdfFile);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }
    
    materials.splice(index, 1);
    saveMaterials(materials);
    res.json({ message: 'Materi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus materi' });
  }
});

// POST upload PDF file
app.post('/api/upload', requireAuth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }
    
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
    
    if (isVercel) {
      // In Vercel, files uploaded to /tmp are temporary
      // WARNING: Files in /tmp will be deleted after function execution
      // For production, you should upload to Vercel Blob Storage or other cloud storage
      
      return res.json({
        message: 'File berhasil diunggah (temporary)',
        filename: req.file.filename,
        path: `/pdf/${req.file.filename}`,
        warning: 'File is temporary in Vercel. Implement cloud storage for production.'
      });
    }
    
    // Local development - file is saved to pdf/ folder
    res.json({
      message: 'File berhasil diunggah',
      filename: req.file.filename,
      path: `/pdf/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Gagal mengunggah file' });
  }
});

// Export as Vercel serverless function
module.exports = app;
