# SmartAttend - Microservices Attendance System #

SmartAttend adalah sistem manajemen absensi berbasis microservices yang dirancang untuk memisahkan logika autentikasi, manajemen data utama, dan antarmuka pengguna. Proyek ini di-deploy menggunakan teknologi containerization (Docker) ke infrastruktur Microsoft Azure.

---

## 1. Arsitektur Sistem ##

Aplikasi ini mengimplementasikan arsitektur **Three-Tier Microservices** sesuai standar industri:

* **Frontend Service (Gateway)**: Sebagai antarmuka pengguna (React) dan penghubung antar service.
* **Auth Service**: Layanan khusus untuk mengelola registrasi, login, dan keamanan berbasis JWT.
* **Main Service**: Layanan inti yang menangani operasi CRUD untuk data absensi siswa.



---

## 2. Arsitektur Database (SQL) ##

Sistem menggunakan **Azure Database for PostgreSQL (Flexible Server)** dengan skema relasional:

* **Tabel `users`**: Menyimpan data akun, kredensial password (hash), dan peran (Student/Lecturer).
* **Tabel `absensi`**: Menyimpan data utama proyek seperti nama siswa, status kehadiran, dan timestamp.

> **Keamanan**: Kredensial database tidak di-*hardcode* melainkan menggunakan **Environment Variables** (`DATABASE_URL`) yang dikonfigurasi langsung di Azure Portal.

---

## 3. Fitur Keamanan & Role ##

Sistem memiliki otorisasi berbasis peran (RBAC) dengan validasi token JWT:

1.  **Lecturer (Admin)**:
    * Akses CRUD penuh (Create, Read, Update, Delete) pada semua data absensi.
    * Fitur tambah siswa manual, edit nama, dan pembaruan status kehadiran.
2.  **Student (User)**:
    * Hanya akses Read (melihat statistik kehadiran pribadi).
    * Data otomatis terdaftar ke dashboard dosen saat registrasi berhasil.

---

## 4. Deployment ke Microsoft Azure ##

Deployment dilakukan menggunakan **Azure Container Apps** dengan alur kerja berikut:

1.  **Dockerization**: Membangun image untuk setiap service.
2.  **Container Registry**: Push image ke Azure Container Registry (ACR).
3.  **App Deployment**: Deploy service ke Container Apps dengan konfigurasi environment variabel untuk koneksi antar service.

---

## 5. Endpoint API ##

### **Auth Service** ###
* `POST /register` - Pendaftaran user baru.
* `POST /login` - Autentikasi dan pengambilan token JWT.

### **Main Service** ###
* `GET /absensi` - Mengambil daftar seluruh siswa.
* `POST /absensi` - Menambahkan data absensi baru.
* `PUT /absensi/:id` - Memperbarui status atau nama siswa.
* `DELETE /absensi/:id` - Menghapus data siswa secara permanen.

---

## UI/UX Preview ##
Sistem dilengkapi dengan dashboard responsif yang mencakup statistik kehadiran real-time, grafik persentase, dan notifikasi status.