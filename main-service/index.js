const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_absensi_siswa_2025';

// Konfigurasi Koneksi Database Azure PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Wajib untuk Azure
});

// Middleware untuk verifikasi Token JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token tidak valid atau kedaluwarsa' });
        req.user = user;
        next();
    });
};

// 1. CREATE: Tambah Siswa (Hanya LECTURER/Admin)
app.post('/absensi', authenticate, async (req, res) => {
    // Menyesuaikan role dengan mockup SmartAttend (LECTURER)
    if (req.user.role !== 'LECTURER' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Hanya Dosen yang dapat menambah siswa" });
    }

    const { nama } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO absensi (nama, status, userId) VALUES ($1, $2, $3) RETURNING *',
            [nama, 'Hadir', 99] // Default status 'Hadir'
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Gagal menyimpan ke database", error: err.message });
    }
});

// 2. READ: Ambil Data (Berdasarkan Role)
app.get('/absensi', authenticate, async (req, res) => {
    try {
        let result;
        // Dosen (LECTURER) bisa melihat semua absensi
        if (req.user.role === 'LECTURER' || req.user.role === 'admin') {
            result = await pool.query('SELECT * FROM absensi ORDER BY id ASC');
        } else {
            // Siswa (STUDENT) hanya melihat data miliknya (jika userId cocok)
            result = await pool.query('SELECT * FROM absensi WHERE userId = $1 ORDER BY id ASC', [req.user.id]);
        }
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil data", error: err.message });
    }
});

// 3. UPDATE: Edit Status atau Nama (CRUD Lengkap)
app.put('/absensi/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { status, nama } = req.body;

    try {
        const check = await pool.query('SELECT * FROM absensi WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });

        // Proteksi: Hanya LECTURER atau pemilik data yang bisa edit
        if (req.user.role !== 'LECTURER' && req.user.role !== 'admin' && check.rows[0].userid !== req.user.id) {
            return res.status(403).json({ message: 'Akses ditolak' });
        }

        const updatedNama = nama || check.rows[0].nama;
        const updatedStatus = status || check.rows[0].status;

        const result = await pool.query(
            'UPDATE absensi SET nama = $1, status = $2 WHERE id = $3 RETURNING *',
            [updatedNama, updatedStatus, id]
        );
        res.json({ message: 'Data diperbarui', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE: Hapus Data Siswa (Hanya LECTURER/Admin)
app.delete('/absensi/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'LECTURER' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya Dosen yang dapat menghapus data' });
    }
    
    const { id } = req.params;
    try {
        const check = await pool.query('SELECT * FROM absensi WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });

        await pool.query('DELETE FROM absensi WHERE id = $1', [id]);
        res.json({ message: 'Data berhasil dihapus dari Azure' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Main Service (SmartAttend Mode) running on port ${PORT}`));