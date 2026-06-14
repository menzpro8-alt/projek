'use client';

import { useExamStore } from '@/lib/store';
import { AppShell } from '@/components/app/AppShell';

export default function Home() {
  const { currentView, role } = useExamStore();

  // AppShell handles all routing including role selection
  return <AppShell />;
}
