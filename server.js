const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: 'time-academy-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  name: 'timeacademy.sid',
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Allow cookies to be sent with cross-site requests
  }
}));

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Protect admin.html - must be before static files middleware
app.get('/admin.html', (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    // User is authenticated, serve the admin page
    return res.sendFile(path.join(__dirname, 'admin.html'));
  } else {
    // User is not authenticated, redirect to home page
    return res.redirect('/index.html?login=required');
  }
});

// Serve static files (admin.html is protected by route above)
app.use(express.static('.', {
  index: ['index.html']
}));
app.use('/pdf', express.static('pdf')); // Serve PDF files

// Authentication credentials
const ADMIN_USERNAME = 'davian';
const ADMIN_PASSWORD = 'timeacademy';

// Helper function to verify password
async function verifyPassword(password) {
  try {
    // For production, use bcrypt to compare with hash
    // For now, using simple comparison
    // After installing bcrypt, you can use:
    // const ADMIN_PASSWORD_HASH = '$2b$10$...'; // Generated hash
    // return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
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

// Generate password hash (run once to get the hash)
// Uncomment to generate hash for "timeacademy"
// bcrypt.hash('timeacademy', 10).then(hash => console.log('Hash:', hash));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'pdf');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Keep original filename or use provided name
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
    const data = fs.readFileSync(path.join(__dirname, 'materials.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to save materials
function saveMaterials(materials) {
  fs.writeFileSync(
    path.join(__dirname, 'materials.json'),
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
    
    // Trim username to handle whitespace
    const trimmedUsername = username ? username.trim() : '';
    
    if (!trimmedUsername || !password) {
      return res.status(400).json({ success: false, error: 'Username dan password harus diisi' });
    }
    
    // Debug logging (remove in production)
    console.log('Login attempt:', { username: trimmedUsername, passwordLength: password.length });
    
    if (trimmedUsername === ADMIN_USERNAME) {
      const isValid = await verifyPassword(password);
      if (isValid) {
        req.session.isAuthenticated = true;
        req.session.username = trimmedUsername;
        console.log('Login successful for:', trimmedUsername);
        return res.json({ success: true, message: 'Login berhasil' });
      } else {
        console.log('Invalid password for:', trimmedUsername);
      }
    } else {
      console.log('Invalid username:', trimmedUsername);
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
      id: materials[index].id // Preserve ID
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
      const pdfPath = path.join(__dirname, 'pdf', material.pdfFile);
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
app.post('/api/upload', requireAuth, upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }
    
    res.json({
      message: 'File berhasil diunggah',
      filename: req.file.filename,
      path: `/pdf/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Gagal mengunggah file' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});

