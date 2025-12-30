// auth-service/index.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Tambahkan ini (install: npm install bcryptjs)
const { Pool } = require('pg'); // Tambahkan ini jika pakai PostgreSQL
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi Database (Pastikan ENV di Azure sudah diisi)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_absensi_siswa_2025';

// ROUTE REGISTER
app.post('/register', async (req, res) => {
    const { nama, email, password, role } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Simpan ke database
        const result = await pool.query(
            'INSERT INTO users (nama, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, nama, email, role',
            [nama, email, hashedPassword, role.toUpperCase()]
        );
        
        const newUser = result.rows[0];

        // Buat token langsung setelah register (opsional, agar user langsung login)
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token: token,
            user: {
                id: newUser.id,
                nama: newUser.nama,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mendaftarkan user. Email mungkin sudah terdaftar." });
    }
});

// ROUTE LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { id: user.id, role: user.role }, 
                JWT_SECRET, 
                { expiresIn: '1h' }
            );

            res.json({
                token: token,
                user: {
                    id: user.id,
                    nama: user.nama,
                    email: user.email,
                    role: user.role // Akan bernilai 'STUDENT' atau 'LECTURER'
                }
            });
        } else {
            res.status(401).json({ message: "Email atau password salah" });
        }
    } catch (err) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
});

app.listen(5000, () => console.log('Auth Service running on port 5000'));