import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getAIGreeting } from '../services/geminiService';
import { Sparkles, Users } from '../components/Icons';

interface LecturerDashboardProps {
  user: User;
}

type AttendanceStatus = 'Present' | 'Permission' | 'Sick' | 'Hadir' | 'Izin' | 'Sakit' | null;

interface StudentAttendanceRecord {
  id: number | string;
  nama: string; 
  status: AttendanceStatus;
}

const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ user }) => {
  const [greeting, setGreeting] = useState('Opening Student Attendance...');
  const [students, setStudents] = useState<StudentAttendanceRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Mengambil URL dari Environment Variable Azure
  const API_BASE_URL = process.env.MAIN_URL || "https://main-service-app-new.salmondesert-ec76229a.centralindia.azurecontainerapps.io";
  const API_URL = `${API_BASE_URL}/absensi`;

  // 1. Fungsi Mengambil Data (Read)
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setSaveMessage("Error: Gagal memuat data");
    }
  };

  useEffect(() => {
    const loadAI = async () => {
      const g = await getAIGreeting(user.name, user.role);
      setGreeting(g);
    };
    loadAI();
    fetchStudents();
  }, [user]);

  // 2. Fungsi Tambah Siswa Manual (Create)
  const handleAddStudent = async () => {
    const namaBaru = prompt("Masukkan nama siswa baru:");
    if (!namaBaru) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ nama: namaBaru, status: null })
      });
      if (res.ok) {
        setSaveMessage('Siswa Berhasil Ditambahkan!');
        fetchStudents();
        setTimeout(() => setSaveMessage(''), 2000);
      }
    } catch (err) {
      alert("Gagal menambah siswa");
    }
  };

  // 3. Fungsi Ubah Status Absensi (Update)
  const handleStatusChange = async (id: number | string, newStatus: string) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setSaveMessage('Status Updated!');
        fetchStudents();
        setTimeout(() => setSaveMessage(''), 2000);
      }
    } catch (err) {
      alert("Gagal update status");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Fungsi Edit Nama (Update)
  const handleEditNama = async (id: number | string, namaLama: string) => {
    const namaBaru = prompt("Perbaiki nama siswa:", namaLama);
    if (!namaBaru || namaBaru === namaLama) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ nama: namaBaru })
      });
      fetchStudents();
    } catch (err) {
      alert("Gagal edit nama");
    }
  };

  // 5. Fungsi Hapus Data (Delete)
  const handleDelete = async (id: number | string) => {
    if (!confirm("Hapus data siswa ini permanen?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'Present' || s.status === 'Hadir').length,
    permission: students.filter(s => s.status === 'Permission' || s.status === 'Izin').length,
    sick: students.filter(s => s.status === 'Sick' || s.status === 'Sakit').length,
    unmarked: students.filter(s => s.status === null).length,
  };

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-left">Student Attendance</h1>
          <p className="text-slate-600 font-medium flex items-center gap-2 mt-2 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
            <Sparkles /> {greeting}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-xl text-slate-700"><Users /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Enrolled Students</p>
              <p className="text-2xl font-black text-slate-800 text-left">{students.length}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Present', count: stats.present, color: 'bg-emerald-500' },
          { label: 'Permission', count: stats.permission, color: 'bg-amber-500' },
          { label: 'Sick', count: stats.sick, color: 'bg-rose-500' },
          { label: 'Unmarked', count: stats.unmarked, color: 'bg-slate-300' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stat.color}`} />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-left">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 text-left">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b border-slate-100 bg-slate-50/30">
          <h3 className="text-xl font-bold text-slate-800">Attendance Sheet</h3>
          <div className="flex items-center gap-3">
             {saveMessage && <span className="text-emerald-600 text-sm font-bold animate-pulse">{saveMessage}</span>}
             
             <button 
              onClick={handleAddStudent}
              className="px-6 py-2 rounded-xl font-black text-xs uppercase bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
            >
              + Add Student
            </button>

             <button 
              onClick={fetchStudents}
              className="px-6 py-2 rounded-xl font-black text-xs uppercase bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Student Information</th>
                <th className="px-8 py-5 text-center">Status Selection</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group text-left">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                        {student.nama ? student.nama.charAt(0) : '?'}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 text-left">{student.nama}</p>
                        <p className="text-xs font-semibold text-slate-400 tracking-tighter text-left">ID: {student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        disabled={isSaving}
                        onClick={() => handleStatusChange(student.id, 'Hadir')}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          (student.status === 'Present' || student.status === 'Hadir')
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                            : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        Present
                      </button>
                      <button 
                        disabled={isSaving}
                        onClick={() => handleStatusChange(student.id, 'Izin')}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          (student.status === 'Permission' || student.status === 'Izin')
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' 
                            : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        Permission
                      </button>
                      <button 
                        disabled={isSaving}
                        onClick={() => handleStatusChange(student.id, 'Sakit')}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          (student.status === 'Sick' || student.status === 'Sakit')
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' 
                            : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                        }`}
                      >
                        Sick
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => handleEditNama(student.id, student.nama)} className="mr-3 hover:scale-125 transition-transform">✏️</button>
                    <button onClick={() => handleDelete(student.id)} className="hover:scale-125 transition-transform text-rose-500">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;