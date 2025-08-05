const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models');

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).single('foto_profil');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate default avatar URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`;

    const user = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      foto_profil: avatarUrl // set default avatar
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: [
        'id',
        'username',
        'email',
        'nama_lengkap',
        'jurusan',
        'foto_profil',
        'created_at',
        'updated_at'
      ]
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadProfilePicture = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Hapus foto lama jika ada
      if (user.foto_profil && user.foto_profil !== `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`) {
        const oldFilePath = user.foto_profil.replace('/uploads/', 'uploads/');
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update foto profil dengan path file baru
      user.foto_profil = `/uploads/profiles/${req.file.filename}`;
      await user.save();

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        jurusan: user.jurusan,
        foto_profil: user.foto_profil,
        created_at: user.created_at,
        updated_at: user.updated_at
      });
    } catch (error) {
      console.error('ERROR UPLOAD PROFILE PICTURE:', error);
      res.status(500).json({ error: error.message });
    }
  });
};

exports.updateMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hanya field yang diizinkan (tanpa foto_profil)
    const allowedFields = ['username', 'email', 'nama_lengkap', 'jurusan'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      nama_lengkap: user.nama_lengkap,
      jurusan: user.jurusan,
      foto_profil: user.foto_profil,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('ERROR UPDATE PROFILE:', error);
    res.status(500).json({ error: error.message });
  }
};