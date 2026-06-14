'use client';

import { useExamStore } from '@/lib/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,
  faChalkboardUser,
  faBook,
  faBolt,
  faEye,
  faShieldHalved,
  faPlay,
  faClock,
  faCheck,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

const TEACHER_FEATURES = [
  { icon: faBook, label: 'Manajemen Bank Soal' },
  { icon: faBolt, label: 'AI Question Generator' },
  { icon: faEye, label: 'Live Monitoring' },
  { icon: faShieldHalved, label: 'Anti-Cheat System' },
];

const STUDENT_FEATURES = [
  { icon: faPlay, label: 'Ujian Interaktif' },
  { icon: faClock, label: 'Timer & Progress' },
  { icon: faCheck, label: 'Hasil Real-time' },
  { icon: faShieldHalved, label: 'Keamanan Ujian' },
];

export function RoleSelector() {
  const setRole = useExamStore((s) => s.setRole);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#F1F5F9] px-4 py-8 overflow-hidden">
      {/* Geometric dot-grid pattern background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.5,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5B6ABF] to-[#4554A0] flex items-center justify-center shadow-lg animate-float">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="text-white text-3xl"
                style={{ width: 36, height: 36 }}
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2D3436] tracking-tight">
            Aplikasi Ujian Online
          </h1>
          <p className="mt-3 text-[#636E72] text-lg sm:text-xl font-medium">
            AI-Powered Exam Platform
          </p>
          <p className="mt-2 text-sm text-[#94A3B8] max-w-md mx-auto">
            Platform ujian online cerdas dengan teknologi AI untuk sekolah modern
          </p>
        </div>

        {/* Role Cards */}
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-3xl">
          {/* Teacher Card */}
          <button
            onClick={() => setRole('teacher')}
            className="group flex-1 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-10 text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] border-l-4 border-[#5B6ABF] hover:border-[#4554A0]"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5B6ABF] to-[#4554A0] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <FontAwesomeIcon
                icon={faChalkboardUser}
                className="text-white text-2xl"
                style={{ width: 32, height: 32 }}
              />
            </div>
            <h2 className="text-2xl font-bold text-[#2D3436] mb-3">Guru</h2>
            <p className="text-[#636E72] text-sm leading-relaxed mb-6">
              Kelola soal, buat ujian, dan pantau siswa secara real-time
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3 mb-6">
              {TEACHER_FEATURES.map((feat) => (
                <div key={feat.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#5B6ABF]/10 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={feat.icon}
                      className="text-[#5B6ABF] text-xs"
                      style={{ width: 14, height: 14 }}
                    />
                  </div>
                  <span className="text-sm text-[#2D3436] font-medium">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[#5B6ABF] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Masuk sebagai Guru</span>
              <FontAwesomeIcon
                icon={faArrowRight}
                style={{ width: 12, height: 12 }}
              />
            </div>
          </button>

          {/* Student Card */}
          <button
            onClick={() => setRole('student')}
            className="group flex-1 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-10 text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] border-l-4 border-emerald-500 hover:border-emerald-600"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="text-white text-2xl"
                style={{ width: 32, height: 32 }}
              />
            </div>
            <h2 className="text-2xl font-bold text-[#2D3436] mb-3">Siswa</h2>
            <p className="text-[#636E72] text-sm leading-relaxed mb-6">
              Kerjakan ujian, pantau progres, dan lihat hasil secara langsung
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3 mb-6">
              {STUDENT_FEATURES.map((feat) => (
                <div key={feat.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={feat.icon}
                      className="text-emerald-600 text-xs"
                      style={{ width: 14, height: 14 }}
                    />
                  </div>
                  <span className="text-sm text-[#2D3436] font-medium">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Masuk sebagai Siswa</span>
              <FontAwesomeIcon
                icon={faArrowRight}
                style={{ width: 12, height: 12 }}
              />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-14 flex items-center gap-4 text-[#94A3B8] text-sm">
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon
              icon={faBolt}
              style={{ width: 12, height: 12 }}
            />
            <span className="font-medium">Powered by AI</span>
          </div>
          <span className="text-[#CBD5E1]">|</span>
          <span className="text-xs">v2.0</span>
        </div>
      </div>
    </div>
  );
}
