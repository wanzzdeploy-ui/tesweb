const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080; // Port Server

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Folder untuk file HTML

// ==========================================
// 🔐 KONFIGURASI KEAMANAN
// ==========================================
const DB_FILE = './database.json';
const ADMIN_KEY = "wanzzganteng123"; // 🔥 GANTI PASSWORD ADMIN DISINI!

// Buat Database otomatis jika belum ada
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, '[]');
}

// Helper Database
const getDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// ==========================================
// 🌐 API ROUTES
// ==========================================

// 1. TAMPILAN WEBSITE
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. CEK LISENSI (DIPANGGIL BOT)
app.get('/check', (req, res) => {
    const number = req.query.number;
    const db = getDB();
    
    if (db.includes(number)) {
        res.json({ status: "active", message: "License Valid", code: 200 });
        console.log(`[LOG] ✅ Akses Diterima: ${number}`);
    } else {
        res.json({ status: "blocked", message: "License Invalid", code: 403 });
        console.log(`[LOG] ⛔ Akses Ditolak: ${number}`);
    }
});

// 3. LIST DATA (UNTUK WEBSITE & BOT OWNER)
app.get('/list', (req, res) => {
    res.json(getDB());
});

// 4. TAMBAH LISENSI
app.post('/add', (req, res) => {
    const { key, number } = req.body;
    if (key !== ADMIN_KEY) return res.send("❌ PASSWORD ADMIN SALAH!");

    let db = getDB();
    if (db.includes(number)) return res.send("⚠️ NOMOR SUDAH TERDAFTAR!");

    db.push(number);
    saveDB(db);
    console.log(`[ADMIN] Menambahkan: ${number}`);
    res.send("✅ SUKSES DITAMBAHKAN");
});

// 5. HAPUS LISENSI
app.post('/del', (req, res) => {
    const { key, number } = req.body;
    if (key !== ADMIN_KEY) return res.send("❌ PASSWORD ADMIN SALAH!");

    let db = getDB();
    const newDb = db.filter(n => n !== number);
    
    if (db.length === newDb.length) return res.send("⚠️ NOMOR TIDAK DITEMUKAN!");

    saveDB(newDb);
    console.log(`[ADMIN] Menghapus: ${number}`);
    res.send("✅ SUKSES DIHAPUS");
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🔥 SERVER LISENSI AKTIF DI PORT ${PORT}`);
    console.log(`🔑 ADMIN KEY: ${ADMIN_KEY}`);
    console.log(`=========================================`);
});
