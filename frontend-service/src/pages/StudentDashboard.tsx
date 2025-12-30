import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getAIGreeting } from '../services/geminiService';
import { Sparkles, Users, GraduationCap } from '../components/Icons';

interface StudentDashboardProps {
  user: User;
}

type AttendanceStatus = 'Present' | 'Permission' | 'Sick' | 'Hadir' | 'Izin' | 'Sakit' | 'Unmarked';

interface AttendanceLog {
  course: string;
  date: string;
  status: AttendanceStatus;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [greeting, setGreeting] = useState('Fetching your attendance records...');
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);

  // --- PERBAIKAN: AMBIL DATA ASLI DARI DATABASE ---
  const API_BASE_URL = process.env.MAIN_URL || "https://main-service-app-new.salmondesert-ec76229a.centralindia.azurecontainerapps.io";

  useEffect(() => {
    const loadAI = async () => {
      const g = await getAIGreeting(user.name, user.role);
      setGreeting(g);
    };

    const fetchMyAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/absensi`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            // Filter hanya data milik user yang sedang login
            const myData = data.filter((item: any) => item.nama === user.name).map((item: any) => ({
                course: 'General Class', // Default karena tabel database sederhana
                date: new Date().toLocaleDateString(),
                status: item.status || 'Unmarked'
            }));
            setAttendanceLogs(myData);
        } catch (err) {
            console.error(err);
        }
    };

    loadAI();
    fetchMyAttendance();
  }, [user]);

  const stats = {
    present: attendanceLogs.filter(l => l.status === 'Present' || l.status === 'Hadir').length,
    permission: attendanceLogs.filter(l => l.status === 'Permission' || l.status === 'Izin').length,
    sick: attendanceLogs.filter(l => l.status === 'Sick' || l.status === 'Sakit').length,
    total: attendanceLogs.length || 1, // Hindari pembagian dengan nol
  };

  const attendancePercentage = Math.round((stats.present / stats.total) * 100);

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-left">My Attendance</h1>
          <p className="text-slate-600 font-medium flex items-center gap-2 mt-2 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
            <Sparkles /> {greeting}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-slate-800 p-2.5 rounded-xl text-white font-black text-sm">RATE</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Attendance %</p>
              <p className="text-2xl font-black text-slate-800 text-left">{attendancePercentage}%</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Present', count: stats.present, color: 'bg-emerald-500' },
          { label: 'Permission', count: stats.permission, color: 'bg-amber-500' },
          { label: 'Sick', count: stats.sick, color: 'bg-rose-500' },
          { label: 'Total Logs', count: attendanceLogs.length, color: 'bg-slate-400' }
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-3`}>
            <div className={`w-3 h-3 rounded-full ${stat.color}`} />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-left">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 text-left">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-left">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Attendance History</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100">Active Semester</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Course / Subject</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendanceLogs.length > 0 ? (
                  attendanceLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group text-left">
                      <td className="px-8 py-5"><p className="font-bold text-slate-900">{log.date}</p></td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><Users /></div>
                          <p className="font-semibold text-slate-700">{log.course}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            (log.status === 'Present' || log.status === 'Hadir') ? 'bg-emerald-100 text-emerald-700' :
                            (log.status === 'Permission' || log.status === 'Izin') ? 'bg-amber-100 text-amber-700' :
                            (log.status === 'Sick' || log.status === 'Sakit') ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr><td colSpan={3} className="p-10 text-center font-bold text-slate-300">No attendance data found in database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;