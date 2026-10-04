'use client';

import React, { useState } from 'react';
import { WeddingProvider, useWedding } from '@/lib/wedding-context';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { TodayView } from '@/components/TodayView';
import { TasksView } from '@/components/TasksView';
import { TeamView } from '@/components/TeamView';
import { ProfileView } from '@/components/ProfileView';
import { QuickTaskModal } from '@/components/QuickTaskModal';
import { NewTaskModal } from '@/components/NewTaskModal';
import { DeclineTaskModal } from '@/components/DeclineTaskModal';
import { ReassignModal } from '@/components/ReassignModal';
import { OnboardingView } from '@/components/OnboardingView';
import { AuthWelcomeView } from '@/components/AuthWelcomeView';
import { NotificationToast } from '@/components/NotificationToast';
import { VoiceNotesDashboardModal } from '@/components/VoiceNotesDashboardModal';
import { VoiceNoteRecorderModal } from '@/components/VoiceNoteRecorderModal';
import { MapsScoutModal } from '@/components/MapsScoutModal';
import { LiveVoiceAssistantModal } from '@/components/LiveVoiceAssistantModal';
import { LiveLocationAssignModal } from '@/components/LiveLocationAssignModal';
import { Task, User } from '@/lib/types';

function MainApp() {
  const { wedding, hasStartedSession, firebaseUser } = useWedding();
  const [currentTab, setCurrentTab] = useState<NavTab>('today');
  
  // Modals state
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isLiveLocationOpen, setIsLiveLocationOpen] = useState(false);
  const [declineTaskTarget, setDeclineTaskTarget] = useState<Task | null>(null);
  const [reassignTaskTarget, setReassignTaskTarget] = useState<Task | null>(null);

  // Voice Notes modals state
  const [isVoiceNotesDashboardOpen, setIsVoiceNotesDashboardOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [voiceRecorderRecipientId, setVoiceRecorderRecipientId] = useState('ALL');

  // AI & Maps Modals state
  const [isMapsScoutOpen, setIsMapsScoutOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [prefilledTaskTitle, setPrefilledTaskTitle] = useState<string | undefined>(undefined);
  const [prefilledTaskLocation, setPrefilledTaskLocation] = useState<string | undefined>(undefined);

  // Show beautiful Welcome & Google Sign-In Screen at app start or when no wedding is selected
  if (!hasStartedSession || !wedding) {
    return <AuthWelcomeView onEnterApp={() => setCurrentTab('today')} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1E1B18] flex flex-col justify-between selection:bg-[#E8DCC8]">
      {/* Real-time alert banner */}
      <NotificationToast
        onOpenTask={() => {
          setCurrentTab('tasks');
        }}
        onOpenVoiceNotes={() => setIsVoiceNotesDashboardOpen(true)}
      />

      {/* Top App Header with Voice Notes & Live AI Triggers */}
      <TopHeader 
        onOpenVoiceNotes={() => setIsVoiceNotesDashboardOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
      />

      {/* Main Content Area (Max width mobile-first viewport) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3">
        {currentTab === 'today' && (
          <TodayView
            onOpenQuickTask={() => setIsQuickTaskOpen(true)}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onDeclineTask={(task) => setDeclineTaskTarget(task)}
            onReassignTask={(task) => setReassignTaskTarget(task)}
            onNavigateToTasks={() => setCurrentTab('tasks')}
            onOpenVoiceNotes={() => setIsVoiceNotesDashboardOpen(true)}
            onOpenLiveLocationAssign={() => setIsLiveLocationOpen(true)}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenQuickTask={() => setIsQuickTaskOpen(true)}
            onReassignTask={(task) => setReassignTaskTarget(task)}
            onDeclineTask={(task) => setDeclineTaskTarget(task)}
            onOpenMapsScout={() => setIsMapsScoutOpen(true)}
          />
        )}

        {currentTab === 'team' && (
          <TeamView
            onAssignDirectTask={() => setIsNewTaskOpen(true)}
            onOpenQuickTaskForMember={() => setIsQuickTaskOpen(true)}
            onSendVoiceNote={(member) => {
              setVoiceRecorderRecipientId(member.id);
              setIsVoiceRecorderOpen(true);
            }}
          />
        )}

        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
        onOpenQuickTask={() => setIsQuickTaskOpen(true)}
        onOpenLiveLocationAssign={() => setIsLiveLocationOpen(true)}
      />

      {/* Modals */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
      />

      <NewTaskModal
        key={prefilledTaskTitle || 'new-task'}
        isOpen={isNewTaskOpen}
        initialTitle={prefilledTaskTitle}
        initialLocation={prefilledTaskLocation}
        onClose={() => {
          setIsNewTaskOpen(false);
          setPrefilledTaskTitle(undefined);
          setPrefilledTaskLocation(undefined);
        }}
      />

      {/* Live Location Radar & Hand-to-Hand Task Assignment Modal */}
      <LiveLocationAssignModal
        isOpen={isLiveLocationOpen}
        onClose={() => setIsLiveLocationOpen(false)}
      />

      <DeclineTaskModal
        task={declineTaskTarget}
        onClose={() => setDeclineTaskTarget(null)}
      />

      <ReassignModal
        task={reassignTaskTarget}
        onClose={() => setReassignTaskTarget(null)}
      />

      {/* Voice Notes Modals */}
      <VoiceNotesDashboardModal
        isOpen={isVoiceNotesDashboardOpen}
        onClose={() => setIsVoiceNotesDashboardOpen(false)}
        onOpenRecorder={(recipientId) => {
          setVoiceRecorderRecipientId(recipientId || 'ALL');
          setIsVoiceRecorderOpen(true);
        }}
      />

      <VoiceNoteRecorderModal
        isOpen={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
        defaultRecipientId={voiceRecorderRecipientId}
      />

      {/* Google Maps Scout Modal (gemini-3.5-flash with googleMaps) */}
      <MapsScoutModal
        isOpen={isMapsScoutOpen}
        onClose={() => setIsMapsScoutOpen(false)}
        onSelectPlaceForTask={(placeTitle) => {
          setPrefilledTaskTitle(`Pickup from ${placeTitle}`);
          setPrefilledTaskLocation(placeTitle);
          setIsNewTaskOpen(true);
        }}
      />

      {/* Live Voice Assistant Modal (gemini-3.8-live) */}
      <LiveVoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
      />
    </div>
  );
}

function useIsClient() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Page() {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex flex-col justify-between max-w-md mx-auto">
        <header className="px-4 py-3.5 border-b border-[#E8DFC8]/60 bg-[#FAF7F2]">
          <div className="h-5 w-32 bg-[#EAE2D2] rounded-md animate-pulse" />
          <div className="h-3 w-20 bg-[#EAE2D2] rounded-md mt-1 animate-pulse" />
        </header>
        <main className="p-4 space-y-4 flex-1">
          <div className="h-7 w-44 bg-[#EAE2D2] rounded-xl animate-pulse" />
          <div className="h-28 w-full bg-white rounded-2xl border border-[#E8DFC8] animate-pulse" />
          <div className="h-36 w-full bg-white rounded-2xl border border-[#E8DFC8] animate-pulse" />
        </main>
        <footer className="h-16 border-t border-[#E8DFC8] bg-white" />
      </div>
    );
  }

  return (
    <WeddingProvider>
      <MainApp />
    </WeddingProvider>
  );
}
