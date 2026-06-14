'use client';

import { useState } from 'react';
import { useExamStore } from '@/lib/store';
import { Icon } from '@/components/shared/Icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleSelector } from './RoleSelector';

// Teacher components
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard';
import { QuestionBank } from '@/components/teacher/QuestionBank';
import QuestionEditor from '@/components/teacher/QuestionEditor';
import ImportWizard from '@/components/teacher/ImportWizard';
import AIGenerator from '@/components/teacher/AIGenerator';
import LiveMonitor from '@/components/teacher/LiveMonitor';
import ExamManager from '@/components/teacher/ExamManager';

// Student components
import StudentDashboard from '@/components/student/StudentDashboard';
import ExamView from '@/components/student/ExamView';
import ExamResults from '@/components/student/ExamResults';

// Teacher sidebar navigation items
const TEACHER_NAV = [
  { key: 'teacher_dashboard' as const, label: 'Dashboard', icon: 'chart-bar' },
  { key: 'teacher_exam_manager' as const, label: 'Ujian', icon: 'file-lines' },
  { key: 'teacher_question_bank' as const, label: 'Bank Soal', icon: 'book' },
  { key: 'teacher_question_editor' as const, label: 'Buat Soal', icon: 'plus' },
  { key: 'teacher_import' as const, label: 'Import Soal', icon: 'upload' },
  { key: 'teacher_ai_generator' as const, label: 'AI Generator', icon: 'bolt' },
  { key: 'teacher_monitor' as const, label: 'Monitor Ujian', icon: 'eye' },
];

// Student sidebar navigation items
const STUDENT_NAV = [
  { key: 'student_dashboard' as const, label: 'Dashboard', icon: 'chart-bar' },
  { key: 'student_exam' as const, label: 'Ujian Aktif', icon: 'play' },
];

// View title mapping
const VIEW_TITLES: Record<string, string> = {
  teacher_dashboard: 'Dashboard',
  teacher_exam_manager: 'Ujian',
  teacher_question_bank: 'Bank Soal',
  teacher_question_editor: 'Buat Soal',
  teacher_import: 'Import Soal',
  teacher_ai_generator: 'AI Generator',
  teacher_monitor: 'Monitor Ujian',
  student_dashboard: 'Dashboard',
  student_exam: 'Ujian Aktif',
  student_results: 'Hasil Ujian',
};

export function AppShell() {
  const { role, currentView, setView, setRole } = useExamStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If no role selected, show role selector
  if (role === null || currentView === 'role_select') {
    return <RoleSelector />;
  }

  // Special full-screen views (exam view and results don't use the sidebar)
  if (currentView === 'student_exam') {
    return <ExamView />;
  }

  if (currentView === 'student_results') {
    return <ExamResults />;
  }

  const navItems = role === 'teacher' ? TEACHER_NAV : STUDENT_NAV;

  const handleNavClick = (view: string) => {
    setView(view as typeof currentView);
    setSidebarOpen(false);
  };

  const handleSwitchRole = () => {
    setRole(null);
    useExamStore.getState().setView('role_select');
  };

  const pageTitle = VIEW_TITLES[currentView] || currentView;

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'teacher_dashboard':
        return <TeacherDashboard />;
      case 'teacher_exam_manager':
        return <ExamManager />;
      case 'teacher_question_bank':
        return <QuestionBank />;
      case 'teacher_question_editor':
        return <QuestionEditor />;
      case 'teacher_import':
        return <ImportWizard />;
      case 'teacher_ai_generator':
        return <AIGenerator />;
      case 'teacher_monitor':
        return <LiveMonitor />;
      case 'student_dashboard':
        return <StudentDashboard />;
      default:
        return (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#CBD5E1] max-w-md">
              <div className="w-14 h-14 rounded-xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
                <Icon icon="layer-group" size="lg" className="text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2D3436] mb-1">{pageTitle}</h3>
              <p className="text-sm text-[#636E72]">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[260px] bg-white border-r border-[#E2E8F0]
          flex flex-col transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#E2E8F0] shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#5B6ABF] flex items-center justify-center">
            <Icon icon="graduation-cap" size="md" className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#2D3436] leading-tight">Ujian Online</span>
            <span className="text-[10px] text-[#94A3B8] font-medium">AI-Powered Platform</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-150 cursor-pointer
                    ${
                      isActive
                        ? 'bg-[#5B6ABF]/10 text-[#5B6ABF]'
                        : 'text-[#636E72] hover:bg-[#F1F5F9] hover:text-[#2D3436]'
                    }
                  `}
                >
                  <Icon
                    icon={item.icon}
                    size="sm"
                    className={isActive ? 'text-[#5B6ABF]' : 'text-[#94A3B8]'}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#5B6ABF]" />
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar footer */}
        <div className="shrink-0 p-3 border-t border-[#E2E8F0]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwitchRole}
            className="w-full justify-start gap-2 text-[#636E72] hover:text-[#2D3436]"
          >
            <Icon icon="right-from-bracket" size="sm" />
            <span>Switch Role</span>
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Icon icon="bars" size="md" />
            </Button>

            <h1 className="text-lg font-semibold text-[#2D3436]">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className={
                role === 'teacher'
                  ? 'bg-[#5B6ABF]/10 text-[#5B6ABF] border-[#5B6ABF]/20 hover:bg-[#5B6ABF]/15'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
              }
            >
              <Icon
                icon={role === 'teacher' ? 'chalkboard-user' : 'graduation-cap'}
                size="sm"
              />
              {role === 'teacher' ? 'Guru' : 'Siswa'}
            </Badge>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
          <div className="page-enter">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
