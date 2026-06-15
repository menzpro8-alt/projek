'use client';

import { useExamStore } from '@/lib/store';
import { Icon } from '@/components/shared/Icon';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const TEACHER_FEATURES = [
  { icon: 'book', label: 'Manajemen Bank Soal' },
  { icon: 'bolt', label: 'AI Question Generator' },
  { icon: 'eye', label: 'Live Monitoring' },
  { icon: 'shield-halved', label: 'Anti-Cheat System' },
];

const STUDENT_FEATURES = [
  { icon: 'play', label: 'Ujian Interaktif' },
  { icon: 'clock', label: 'Timer & Progress' },
  { icon: 'check', label: 'Hasil Real-time' },
  { icon: 'shield-halved', label: 'Keamanan Ujian' },
];

export function RoleSelector() {
  const setRole = useExamStore((s) => s.setRole);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8 overflow-hidden">
      {/* Geometric dot-grid pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #4F46E5 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top-right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo to-indigo-dark flex items-center justify-center shadow-lg shadow-indigo/20 animate-float">
              <Icon icon="graduation-cap" size="xl" className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Aplikasi Ujian Online
          </h1>
          <p className="mt-3 gradient-text text-lg sm:text-xl font-semibold">
            AI-Powered Exam Platform
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Platform ujian online cerdas dengan teknologi AI untuk sekolah modern
          </p>
        </div>

        {/* Role Cards */}
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-3xl">
          {/* Teacher Card */}
          <button
            onClick={() => setRole('teacher')}
            className="group flex-1 glass-card rounded-2xl hover:shadow-xl hover:shadow-indigo/10 transition-all duration-300 p-10 text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] border-l-[3px] border-indigo hover:border-indigo-light"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo to-indigo-dark flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo/20 transition-all duration-300">
              <Icon icon="chalkboard-user" size="xl" className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Guru</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Kelola soal, buat ujian, dan pantau siswa secara real-time
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3 mb-6">
              {TEACHER_FEATURES.map((feat) => (
                <div key={feat.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-soft flex items-center justify-center shrink-0 dark:bg-indigo/20">
                    <Icon icon={feat.icon} size="sm" className="text-indigo" />
                  </div>
                  <span className="text-sm text-foreground font-medium">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-indigo text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Masuk sebagai Guru</span>
              <Icon icon="arrow-right" size="sm" />
            </div>
          </button>

          {/* Student Card */}
          <button
            onClick={() => setRole('student')}
            className="group flex-1 glass-card rounded-2xl hover:shadow-xl hover:shadow-teal/10 transition-all duration-300 p-10 text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] border-l-[3px] border-teal hover:border-teal-light"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-teal/20 transition-all duration-300">
              <Icon icon="graduation-cap" size="xl" className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Siswa</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Kerjakan ujian, pantau progres, dan lihat hasil secara langsung
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3 mb-6">
              {STUDENT_FEATURES.map((feat) => (
                <div key={feat.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                    <Icon icon={feat.icon} size="sm" className="text-teal" />
                  </div>
                  <span className="text-sm text-foreground font-medium">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-teal text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Masuk sebagai Siswa</span>
              <Icon icon="arrow-right" size="sm" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-14 flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <Icon icon="bolt" size="sm" />
            <span className="font-medium">Powered by AI</span>
          </div>
          <span className="text-border">|</span>
          <span className="text-xs">v2.0</span>
        </div>
      </div>
    </div>
  );
}
