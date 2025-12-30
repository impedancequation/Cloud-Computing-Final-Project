import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { GraduationCap, BookOpen } from '../components/Icons';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // --- LOGIKA KONEKSI AZURE DIMULAI DI SINI ---
  // AuthPage.tsx

  // Tambahkan variabel API Main Service di bagian atas
  const MAIN_API_URL = process.env.MAIN_URL || "https://main-service-app-new.salmondesert-ec76229a.centralindia.azurecontainerapps.io";
  const AUTH_API_URL = process.env.AUTH_API_URL || "https://auth-service-app-new.salmondesert-ec76229a.centralindia.azurecontainerapps.io";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? `${AUTH_API_URL}/login` : `${AUTH_API_URL}/register`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nama: formData.name, 
          role: role 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- LOGIKA OTOMATIS TAMBAH KE DASHBOARD LECTURER ---
        // Jika user baru mendaftar (bukan login) dan rolenya adalah STUDENT
        if (!isLogin && role === UserRole.STUDENT) {
          try {
            await fetch(`${MAIN_API_URL}/absensi`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nama: formData.name,
                status: null // Status awal adalah Unmarked
              }),
            });
            console.log("Data siswa otomatis terdaftar ke main-service");
          } catch (err) {
            console.error("Gagal sinkronisasi ke main-service:", err);
          }
        }
        // --- SELESAI LOGIKA OTOMATIS ---

        localStorage.setItem('token', data.token);
        
        const authenticatedUser: User = {
          id: data.user.id,
          name: data.user.nama || data.user.name,
          email: data.user.email,
          role: data.user.role as UserRole
        };

        onLogin(authenticatedUser);
        alert(isLogin ? "Login Berhasil!" : "Registrasi Berhasil! Data Anda sudah masuk ke daftar dosen.");
        if (!isLogin) setIsLogin(true);
      } else {
        alert("Gagal: " + (data.message || "Email atau password salah"));
      }
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Koneksi ke server Azure gagal.");
    }
  };
  // --- LOGIKA KONEKSI AZURE SELESAI ---

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="bg-slate-700 p-4 rounded-2xl text-white shadow-lg shadow-slate-200">
              <GraduationCap />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-center text-slate-500 mb-8 font-medium">
            Manage your academic journey with SmartAttend
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-left">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all outline-none"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-left">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all outline-none"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-left">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="py-2">
              <label className="block text-sm font-semibold text-slate-700 mb-4 text-center uppercase tracking-wider">Select Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.STUDENT)}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    role === UserRole.STUDENT
                      ? 'border-slate-800 bg-slate-800 text-white shadow-lg'
                      : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50'
                  }`}
                >
                  <GraduationCap />
                  <span className="font-bold">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.LECTURER)}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    role === UserRole.LECTURER
                      ? 'border-slate-800 bg-slate-800 text-white shadow-lg'
                      : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50'
                  }`}
                >
                  <BookOpen />
                  <span className="font-bold">Lecturer</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-slate-200 mt-2 transform active:scale-[0.98]"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-600 font-bold hover:text-slate-900 transition-colors"
            >
              {isLogin ? "New here? Create an account" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;