
import React, { useState, useEffect } from 'react';
import { User, UserRole, AuthState } from './types';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import { LayoutDashboard, LogOut, GraduationCap, BookOpen, Users } from './components/Icons';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('edu_auth');
    if (saved) {
      setAuth({ user: JSON.parse(saved), isAuthenticated: true });
    }
  }, []);

  const handleLogin = (user: User) => {
    setAuth({ user, isAuthenticated: true });
    localStorage.setItem('edu_auth', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    localStorage.removeItem('edu_auth');
    localStorage.removeItem('token'); 

    alert("Anda telah keluar dari sistem.");
  };

  if (!auth.isAuthenticated || !auth.user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const isLecturer = auth.user.role === UserRole.LECTURER;

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-10 flex items-center gap-4">
          <div className="bg-slate-800 p-2.5 rounded-2xl text-white shadow-xl shadow-slate-100">
            <GraduationCap />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 italic">SmartAttend</span>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          {isLecturer ? (
            <button className="w-full flex items-center gap-4 px-5 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all text-left">
              <Users /> Student Attendance
            </button>
          ) : (
            <button className="w-full flex items-center gap-4 px-5 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all text-left">
              <Users /> My Attendance
            </button>
          )}
        </nav>

        <div className="p-8 mt-auto">
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {auth.user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-slate-900 truncate text-sm">{auth.user.name}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{auth.user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-100 hover:bg-red-50 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
            >
              <LogOut /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-xl text-white">
              <GraduationCap />
            </div>
            <span className="font-black text-xl tracking-tighter italic">SmartAttend</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-600 transition-colors p-2">
            <LogOut />
          </button>
        </div>

        <div className="max-w-screen-2xl mx-auto">
          {isLecturer ? (
            <LecturerDashboard user={auth.user} />
          ) : (
            <StudentDashboard user={auth.user} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
