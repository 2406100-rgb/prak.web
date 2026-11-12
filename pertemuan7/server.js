// File: server.js - Backend Node.js Express & MySQL
const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

// Middleware untuk parsing JSON dan menyajikan file statis frontend
app.use(express.json());
app.use(express.static('public'));

// 1. Koneksi ke Database MySQL Laragon
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Password default MySQL Laragon kosong
  database: 'database_mahasiswa' // ganti ke 'db_kampus' jika memakai database dari modul
});

db.connect((err) => {
  if (err) {
    console.error('Koneksi database gagal:', err.message);
    return;
  }
  console.log('Terhubung ke database MySQL Laragon');
});

// 2. READ: Ambil seluruh data mahasiswa
app.get('/api/mahasiswa', (req, res) => {
  db.query('SELECT * FROM mahasiswa ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json(results);
  });
});

// 3. CREATE: Tambah mahasiswa baru
app.post('/api/mahasiswa', (req, res) => {
  const { nim, nama, jurusan, email } = req.body;
  const sql = 'INSERT INTO mahasiswa (nim, nama, jurusan, email) VALUES (?, ?, ?, ?)';
  db.query(sql, [nim, nama, jurusan, email], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'NIM sudah terdaftar!' });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: 'Data mahasiswa berhasil disimpan!' });
  });
});

// 4. UPDATE: Ubah data mahasiswa
app.put('/api/mahasiswa/:id', (req, res) => {
  const { id } = req.params;
  const { nim, nama, jurusan, email } = req.body;
  const sql = 'UPDATE mahasiswa SET nim = ?, nama = ?, jurusan = ?, email = ? WHERE id = ?';
  db.query(sql, [nim, nama, jurusan, email, id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'NIM sudah terdaftar!' });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: 'Data mahasiswa berhasil diperbarui!' });
  });
});

// 5. DELETE: Hapus data mahasiswa
app.delete('/api/mahasiswa/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM mahasiswa WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Data mahasiswa berhasil dihapus!' });
  });
});

app.listen(PORT, () => {
  console.log(`Server CRUD aktif di http://localhost:${PORT}`);
});