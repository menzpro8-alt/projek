'use client';

import { useExamStore } from '@/lib/store';
import type { AppView, ExamStatus } from '@/lib/types';
import { MOCK_EXAMS, SUBJECTS } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChalkboardUser,
  faBook,
  faPlay,
  faUsers,
  faChartBar,
  faArrowUp,
  faArrowDown,
  faPlus,
  faUpload,
  faBolt,
  faEye,
  faClock,
  faShieldHalved,
  faCircle,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ============================================================
// Mock Chart Data
// ============================================================
const AVG_SCORE_DATA = [
  { subject: 'MTK', score: 78 },
  { subject: 'BIN', score: 85 },
  { subject: 'IPA', score: 72 },
  { subject: 'IPS', score: 80 },
  { subject: 'BIG', score: 68 },
];

const QUESTION_TYPE_DATA = [
  { name: 'Pilihan Ganda', value: 45 },
  { name: 'PG Kompleks', value: 20 },
  { name: 'Menjodohkan', value: 35 },
];

const CHART_COLORS = ['#5B6ABF', '#00B894', '#FDCB6E', '#FF6B6B', '#74B9FF'];

// ============================================================
// Stats Config
// ============================================================
const STATS = [
  {
    label: 'Total Soal',
    value: '156',
    icon: faBook,
    iconBg: 'bg-[#5B6ABF]/10',
    iconColor: 'text-[#5B6ABF]',
    borderColor: 'border-l-[#5B6ABF]',
    trend: '+12%',
    trendUp: true,
  },
  {
    label: 'Ujian Aktif',
    value: '3',
    icon: faPlay,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: 'border-l-emerald-500',
    trend: '+8%',
    trendUp: true,
  },
  {
    label: 'Siswa Online',
    value: '24',
    icon: faUsers,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-l-amber-500',
    trend: '-3%',
    trendUp: false,
  },
  {
    label: 'Rata-rata Nilai',
    value: '78.5',
    icon: faChartBar,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    borderColor: 'border-l-sky-500',
    trend: '+5%',
    trendUp: true,
  },
];

// ============================================================
// Recent Activity
// ============================================================
const RECENT_ACTIVITY = [
  {
    id: '1',
    text: 'Soal baru ditambahkan ke Bank Soal Aljabar',
    time: '5 menit lalu',
    icon: faPlus,
    iconColor: 'text-emerald-600',
    borderColor: 'border-l-emerald-500',
  },
  {
    id: '2',
    text: 'Ujian Matematika X dimulai',
    time: '15 menit lalu',
    icon: faPlay,
    iconColor: 'text-[#5B6ABF]',
    borderColor: 'border-l-[#5B6ABF]',
  },
  {
    id: '3',
    text: 'Siswa Ahmad Rizki menyelesaikan ujian',
    time: '30 menit lalu',
    icon: faShieldHalved,
    iconColor: 'text-emerald-600',
    borderColor: 'border-l-emerald-500',
  },
  {
    id: '4',
    text: 'AI generated 5 soal baru untuk Fisika',
    time: '1 jam lalu',
    icon: faBolt,
    iconColor: 'text-amber-600',
    borderColor: 'border-l-amber-500',
  },
  {
    id: '5',
    text: 'Bank Soal Bahasa Inggris diperbarui',
    time: '2 jam lalu',
    icon: faBook,
    iconColor: 'text-[#5B6ABF]',
    borderColor: 'border-l-[#5B6ABF]',
  },
];

// ============================================================
// Quick Actions
// ============================================================
const QUICK_ACTIONS = [
  {
    key: 'teacher_question_editor' as AppView,
    label: 'Buat Soal Baru',
    icon: faPlus,
    bg: 'bg-[#5B6ABF]',
    hoverBg: 'hover:bg-[#4A59AE]',
  },
  {
    key: 'teacher_import' as AppView,
    label: 'Import Soal',
    icon: faUpload,
    bg: 'bg-white border border-[#E2E8F0]',
    hoverBg: 'hover:bg-[#F8FAFC]',
  },
  {
    key: 'teacher_ai_generator' as AppView,
    label: 'AI Generator',
    icon: faBolt,
    bg: 'bg-white border border-[#E2E8F0]',
    hoverBg: 'hover:bg-[#F8FAFC]',
  },
  {
    key: 'teacher_monitor' as AppView,
    label: 'Monitor Ujian',
    icon: faEye,
    bg: 'bg-white border border-[#E2E8F0]',
    hoverBg: 'hover:bg-[#F8FAFC]',
  },
];

// ============================================================
// Helpers
// ============================================================
function getSubjectName(subjectId: string): string {
  const s = SUBJECTS.find((sub) => sub.id === subjectId);
  return s ? s.name : subjectId;
}

function formatDateIndonesian(): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

const STATUS_CONFIG: Record<ExamStatus, { label: string; bg: string; text: string; dot?: string }> = {
  active: { label: 'Aktif', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  published: { label: 'Terbit', bg: 'bg-[#5B6ABF]/10', text: 'text-[#5B6ABF]' },
  draft: { label: 'Draft', bg: 'bg-[#94A3B8]/10', text: 'text-[#636E72]' },
  completed: { label: 'Selesai', bg: 'bg-sky-100', text: 'text-sky-700' },
};

// ============================================================
// Custom Tooltip for Charts
// ============================================================
function BarChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-[#E2E8F0] px-3 py-2 text-xs">
      <p className="font-semibold text-[#2D3436]">{label}</p>
      <p className="text-[#5B6ABF]">{`Nilai: ${payload[0].value}`}</p>
    </div>
  );
}

function PieChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-[#E2E8F0] px-3 py-2 text-xs">
      <p className="font-semibold text-[#2D3436]">{payload[0].name}</p>
      <p className="text-[#5B6ABF]">{`${payload[0].value} soal`}</p>
    </div>
  );
}

// ============================================================
// Component
// ============================================================
export function TeacherDashboard() {
  const setView = useExamStore((s) => s.setView);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ===== Welcome Card ===== */}
      <Card className="bg-gradient-to-r from-[#5B6ABF] to-[#4554A0] text-white border-0 overflow-hidden relative">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Glass-morphism icon circle */}
              <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                <FontAwesomeIcon
                  icon={faChalkboardUser}
                  className="text-white text-xl"
                  style={{ width: 24, height: 24 }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">Selamat Datang, Guru</h2>
                <p className="text-white/70 text-sm mt-0.5">
                  {formatDateIndonesian()}
                </p>
                <p className="text-white/50 text-xs mt-1 italic">
                  &quot;Pendidikan adalah senjata paling ampuh untuk mengubah dunia.&quot; - Nelson Mandela
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Button
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/15 hover:text-white h-9 text-sm"
                onClick={() => setView('teacher_question_editor')}
              >
                <FontAwesomeIcon icon={faPlus} style={{ width: 14, height: 14 }} className="mr-2" />
                Buat Soal
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/15 hover:text-white h-9 text-sm"
                onClick={() => setView('teacher_monitor')}
              >
                <FontAwesomeIcon icon={faEye} style={{ width: 14, height: 14 }} className="mr-2" />
                Monitor Ujian
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Stats Grid ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card
            key={stat.label}
            className={`hover:shadow-md transition-shadow border-l-4 ${stat.borderColor}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}
                >
                  <FontAwesomeIcon
                    icon={stat.icon}
                    className={stat.iconColor}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#636E72] font-medium truncate">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-[#2D3436] leading-tight">
                      {stat.value}
                    </p>
                    <span
                      className={`text-xs font-semibold flex items-center gap-0.5 ${
                        stat.trendUp ? 'text-emerald-600' : 'text-[#FF6B6B]'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={stat.trendUp ? faArrowUp : faArrowDown}
                        style={{ width: 10, height: 10 }}
                      />
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== Exam Overview ===== */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#2D3436]">
              Ikhtisar Ujian
            </CardTitle>
            <button className="text-sm text-[#5B6ABF] font-medium flex items-center gap-1 hover:underline">
              Lihat Semua
              <FontAwesomeIcon
                icon={faChevronRight}
                style={{ width: 10, height: 10 }}
              />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {MOCK_EXAMS.map((exam) => {
              const statusCfg = STATUS_CONFIG[exam.status];
              return (
                <div
                  key={exam.id}
                  className="min-w-[260px] flex-shrink-0 rounded-xl border border-[#E2E8F0] bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-[#2D3436] leading-tight line-clamp-2">
                      {exam.title}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      {exam.status === 'active' && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`}
                        />
                      )}
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#636E72] mb-3">
                    {getSubjectName(exam.subjectId)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faBook}
                        style={{ width: 11, height: 11 }}
                      />
                      {exam.questions.length} soal
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faClock}
                        style={{ width: 11, height: 11 }}
                      />
                      {exam.durationMinutes} min
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ===== Charts Section ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Average Score per Subject */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#2D3436]">
              Nilai Rata-rata per Mata Pelajaran
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AVG_SCORE_DATA} barCategoryGap="20%">
                  <XAxis
                    dataKey="subject"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#636E72' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#636E72' }}
                    domain={[0, 100]}
                    width={35}
                  />
                  <Tooltip content={<BarChartTooltip />} />
                  <Bar
                    dataKey="score"
                    fill="#5B6ABF"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Question Type Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#2D3436]">
              Distribusi Tipe Soal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[240px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={QUESTION_TYPE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {QUESTION_TYPE_DATA.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="space-y-1.5 shrink-0 pr-2">
                {QUESTION_TYPE_DATA.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-[#636E72]">{entry.name}</span>
                    <span className="font-semibold text-[#2D3436] ml-auto">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== Content Grid: Activity + Quick Actions ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold text-[#2D3436]">
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              {RECENT_ACTIVITY.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[#F1F5F9] transition-colors border-l-3 ${activity.borderColor}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={activity.icon}
                      className={activity.iconColor}
                      style={{ width: 14, height: 14 }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2D3436] truncate">
                      {activity.text}
                    </p>
                  </div>
                  <span className="text-xs text-[#94A3B8] whitespace-nowrap shrink-0 flex items-center gap-1">
                    <FontAwesomeIcon
                      icon={faClock}
                      style={{ width: 10, height: 10 }}
                    />
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold text-[#2D3436]">
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  onClick={() => setView(action.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${action.bg} ${action.hoverBg} cursor-pointer group`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      action.key === 'teacher_question_editor'
                        ? 'bg-white/20'
                        : 'bg-[#5B6ABF]/10'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={action.icon}
                      className={
                        action.key === 'teacher_question_editor'
                          ? 'text-white'
                          : 'text-[#5B6ABF]'
                      }
                      style={{ width: 16, height: 16 }}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      action.key === 'teacher_question_editor'
                        ? 'text-white'
                        : 'text-[#2D3436]'
                    }`}
                  >
                    {action.label}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`ml-auto transition-transform group-hover:translate-x-0.5 ${
                      action.key === 'teacher_question_editor'
                        ? 'text-white/60'
                        : 'text-[#94A3B8]'
                    }`}
                    style={{ width: 12, height: 12 }}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
