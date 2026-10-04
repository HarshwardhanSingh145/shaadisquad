'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { Task, TaskStatus } from '@/lib/types';
import { 
  Zap, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  UserCheck, 
  ArrowRight,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { OperationsStatusModal, OperationFilterType } from './OperationsStatusModal';

interface TodayViewProps {
  onOpenQuickTask: () => void;
  onOpenNewTask: () => void;
  onDeclineTask: (task: Task) => void;
  onReassignTask: (task: Task) => void;
  onNavigateToTasks: () => void;
  onOpenVoiceNotes?: () => void;
  onOpenLiveLocationAssign?: () => void;
}

export function TodayView({
  onOpenQuickTask,
  onOpenNewTask,
  onDeclineTask,
  onReassignTask,
  onNavigateToTasks,
  onOpenVoiceNotes,
  onOpenLiveLocationAssign,
}: TodayViewProps) {
  const {
    wedding,
    currentUser,
    tasks,
    timeline,
    joinRequests,
    voiceNotes,
    approveJoinRequest,
    rejectJoinRequest,
    updateTaskStatus,
    requestTaskHelp,
    resolveTaskHelp
  } = useWedding();

  const [activeHelpTaskId, setActiveHelpTaskId] = useState<string | null>(null);
  const [operationsModalType, setOperationsModalType] = useState<OperationFilterType | null>(null);

  if (!wedding) return null;

  // Filter tasks
  const myTasks = tasks.filter((t) => t.assignedUserId === currentUser?.id);
  const pendingRequests = joinRequests.filter((r) => r.status === 'PENDING');
  const quickTasks = tasks.filter((t) => t.isQuickTask && t.status !== 'COMPLETED');
  const activeHelpTasks = tasks.filter((t) => t.helpRequested && t.status !== 'COMPLETED');

  // Counts for Admin situational summary
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const isAdmin = currentUser?.role === 'ADMIN';
  const isCoordinator = currentUser?.role === 'COORDINATOR';

  // Current and Next Timeline item
  const currentTimelineEvent = timeline.find((e) => e.isCurrent) || timeline[0];
  const nextTimelineEvent = timeline.find((e, idx) => {
    const currIdx = timeline.findIndex((item) => item.id === currentTimelineEvent?.id);
    return idx === currIdx + 1;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Greeting Banner */}
      <div className="pt-2">
        <h1 className="text-xl font-bold text-[#2B1E16] tracking-tight">
          Good Morning, {currentUser?.name} 👋
        </h1>
        <p className="text-xs text-[#7C6A58] mt-0.5">
          {currentUser?.role === 'ADMIN'
            ? 'Wedding Squad Lead · Full team oversight'
            : currentUser?.role === 'COORDINATOR'
            ? 'Wedding Coordinator · Work assignment active'
            : 'Team Member · Your assigned responsibilities today'}
        </p>
      </div>

      {/* Admin / Coordinator Join Requests Banner (1-tap Approve/Reject) */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#92400E] flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#D97706]" />
              New Join Request ({pendingRequests.length})
            </span>
          </div>

          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-2.5 bg-white/90 rounded-xl border border-[#FDE68A]"
              >
                <div>
                  <p className="text-xs font-bold text-[#2B1E16]">
                    {req.userName}
                  </p>
                  <p className="text-[10px] text-[#7C6A58]">
                    Wants to join as {req.requestedRole === 'COORDINATOR' ? 'Coordinator' : 'Team Member'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => rejectJoinRequest(req.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#7C6A58] hover:bg-[#F3EDE2] transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveJoinRequest(req.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#15803D] hover:bg-[#166534] text-white transition-colors shadow-xs"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgent Help Requests Alert Banner */}
      {activeHelpTasks.length > 0 && (isAdmin || isCoordinator) && (
        <div className="p-3.5 rounded-2xl bg-[#FFF7ED] border border-[#FDBA74] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#9A3412] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#EA580C]" />
              Help Requested on {activeHelpTasks.length} task{activeHelpTasks.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {activeHelpTasks.map((task) => (
              <div
                key={task.id}
                className="p-2.5 bg-white rounded-xl border border-[#FED7AA] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2B1E16] truncate">
                    🆘 {task.assignedUserName}: {task.title}
                  </p>
                  <p className="text-[10px] text-[#7C6A58] truncate">
                    📍 {task.location} · {task.helpReason || 'Needs help'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onReassignTask(task)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#4A3525] text-white hover:bg-[#382618]"
                  >
                    Reassign
                  </button>
                  <button
                    onClick={() => resolveTaskHelp(task.id)}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium text-[#7C6A58] hover:bg-[#F3EDE2]"
                  >
                    Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Notes Quick Bar */}
      {voiceNotes.length > 0 && onOpenVoiceNotes && (
        <div className="p-3.5 rounded-2xl bg-[#FAF0E6] border border-[#DECDB3] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#4A3525] text-white flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-[#FDE68A]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#2B1E16]">Squad Voice Notes</span>
                <span className="text-[10px] font-bold bg-[#DC2626] text-white px-1.5 py-0.2 rounded-full">
                  {voiceNotes.length}
                </span>
              </div>
              <p className="text-[11px] text-[#7C6A58] truncate mt-0.5">
                Latest: {voiceNotes[0]?.senderName} — &ldquo;{voiceNotes[0]?.transcription || 'Audio message'}&rdquo;
              </p>
            </div>
          </div>
          <button
            onClick={onOpenVoiceNotes}
            className="px-3 py-1.5 rounded-xl bg-[#4A3525] text-white text-xs font-bold hover:bg-[#382618] transition-colors shrink-0"
          >
            Open
          </button>
        </div>
      )}

      {/* Situational Overview Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7C6A58]">
            Today&apos;s Operations
          </span>
          <button
            onClick={onNavigateToTasks}
            className="text-xs font-bold text-[#4A3525] hover:underline flex items-center gap-0.5"
          >
            All Tasks ({totalCount}) &rarr;
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            type="button"
            onClick={() => setOperationsModalType('PENDING')}
            className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#EFE7D8] transition-all transform active:scale-95 text-center group cursor-pointer shadow-2xs hover:shadow-xs"
            title="Click to see all Pending tasks"
          >
            <span className="block text-lg font-bold text-[#2B1E16] tabular-nums group-hover:scale-105 transition-transform">
              {pendingCount}
            </span>
            <span className="block text-[10px] font-medium text-[#7C6A58] group-hover:text-[#2B1E16]">
              Pending
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOperationsModalType('IN_PROGRESS')}
            className="p-2 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] transition-all transform active:scale-95 text-center group cursor-pointer shadow-2xs hover:shadow-xs"
            title="Click to see all In-Progress tasks"
          >
            <span className="block text-lg font-bold text-[#B45309] tabular-nums group-hover:scale-105 transition-transform">
              {inProgressCount}
            </span>
            <span className="block text-[10px] font-medium text-[#B45309]">
              In Progress
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOperationsModalType('COMPLETED')}
            className="p-2 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] transition-all transform active:scale-95 text-center group cursor-pointer shadow-2xs hover:shadow-xs"
            title="Click to see all Completed tasks"
          >
            <span className="block text-lg font-bold text-[#15803D] tabular-nums group-hover:scale-105 transition-transform">
              {completedCount}
            </span>
            <span className="block text-[10px] font-medium text-[#15803D]">
              Completed
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOperationsModalType('QUICK')}
            className="p-2 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] transition-all transform active:scale-95 text-center group cursor-pointer shadow-2xs hover:shadow-xs"
            title="Click to see all Quick tasks"
          >
            <span className="block text-lg font-bold text-[#DC2626] tabular-nums group-hover:scale-105 transition-transform">
              {quickTasks.length}
            </span>
            <span className="block text-[10px] font-medium text-[#DC2626]">
              Quick Tasks
            </span>
          </button>
        </div>

        {/* Proximity shortcut & tap hint */}
        <div className="mt-3 pt-2.5 border-t border-[#F2ECE1] flex items-center justify-between text-[11px]">
          <span className="text-[#8C7A68]">
            Tap any box to view details &amp; actions
          </span>
          {onOpenLiveLocationAssign && (
            <button
              type="button"
              onClick={onOpenLiveLocationAssign}
              className="font-bold text-[#166534] bg-[#DCFCE7] hover:bg-[#BBF7D0] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              📍 Live Location &rarr;
            </button>
          )}
        </div>
      </div>

      {/* YOUR WORK SECTION */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold tracking-tight text-[#2B1E16] uppercase">
            Your Work ({myTasks.filter(t => t.status !== 'COMPLETED').length} active)
          </h2>
          {myTasks.length === 0 && (
            <span className="text-xs text-[#7C6A58]">No tasks assigned</span>
          )}
        </div>

        {myTasks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-[#E8DFC8] text-center">
            <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-[#2B1E16]">You are all caught up!</p>
            <p className="text-[11px] text-[#7C6A58] mt-0.5">
              No tasks pending for you. Stand by for urgent quick work or help teammates.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTasks.map((task) => {
              const isUrgent = task.priority === 'URGENT';
              const isCompleted = task.status === 'COMPLETED';
              const isPending = task.status === 'PENDING';
              const isInProgress = task.status === 'IN_PROGRESS';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-[#F9FAF8] border-[#DCFCE7] opacity-85'
                      : isUrgent
                      ? 'bg-[#FFF8F8] border-[#FECACA] shadow-xs'
                      : 'bg-white border-[#E8DFC8] shadow-xs'
                  }`}
                >
                  {/* Task Top Meta */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isCompleted
                            ? 'bg-[#15803D]'
                            : isInProgress
                            ? 'bg-[#F59E0B]'
                            : isUrgent
                            ? 'bg-[#DC2626] animate-pulse'
                            : 'bg-[#EA580C]'
                        }`}
                      />
                      <span className="text-xs font-bold text-[#2B1E16]">
                        {task.title}
                      </span>
                    </div>

                    {isUrgent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full shrink-0">
                        Urgent
                      </span>
                    )}
                  </div>

                  {/* Location, Time & Category Tag */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7C6A58] mb-3 ml-4.5">
                    {task.category && (
                      <span className="font-bold text-[#4A3525] bg-[#F5EFE6] px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                        {task.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-medium text-[#4A3B2E]">
                      <Clock className="w-3.5 h-3.5 text-[#8C7A68]" />
                      {task.dueTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#8C7A68]" />
                      {task.location}
                    </span>
                    {task.isQuickTask && (
                      <span className="text-[10px] font-bold text-[#DC2626] flex items-center gap-0.5">
                        <Zap className="w-3 h-3 fill-current" /> Quick Task
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-[#5C4A3A] bg-[#FAF7F2] p-2 rounded-xl mb-3 ml-4.5 border border-[#EFE7D8]">
                      {task.description}
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] ml-4.5 gap-2">
                    {/* Status Actions */}
                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="px-3 py-1.5 rounded-xl bg-[#4A3525] hover:bg-[#382618] text-white text-xs font-bold transition-all shadow-xs"
                          >
                            Accept & Start
                          </button>
                          <button
                            onClick={() => onDeclineTask(task)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#7C6A58] hover:bg-[#FAF7F2] hover:text-[#DC2626] transition-colors"
                          >
                            Can&apos;t Do
                          </button>
                        </>
                      )}

                      {isInProgress && (
                        <>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                            className="px-3.5 py-1.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Completed
                          </button>
                          <button
                            onClick={() => requestTaskHelp(task.id)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#EA580C] hover:bg-[#FFF7ED] border border-[#FDBA74]/60 transition-colors"
                          >
                            Need Help
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803D]">
                          <CheckCircle2 className="w-4 h-4" />
                          Finished
                        </div>
                      )}
                    </div>

                    {/* Reassign action if Admin/Coordinator */}
                    {(isAdmin || isCoordinator) && (
                      <button
                        onClick={() => onReassignTask(task)}
                        className="text-[11px] font-semibold text-[#7C6A58] hover:text-[#4A3525] hover:underline"
                      >
                        Reassign
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WEDDING TIMELINE: What is happening now? What is next? */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C6A58]">
            Wedding Schedule
          </h3>
          <span className="text-[11px] font-semibold text-[#15803D]">
            Live Timeline
          </span>
        </div>

        <div className="space-y-2.5">
          {timeline.map((event) => (
            <div
              key={event.id}
              className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                event.isCurrent
                  ? 'bg-[#FAF4EB] border border-[#DECDB3]'
                  : 'hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="min-w-[65px] pt-0.5">
                <span className={`text-xs font-bold block ${event.isCurrent ? 'text-[#4A3525]' : 'text-[#7C6A58]'}`}>
                  {event.time}
                </span>
                {event.isCurrent && (
                  <span className="text-[9px] font-bold uppercase text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.2 rounded">
                    Now
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#2B1E16] truncate">
                  {event.title}
                </p>
                <p className="text-[11px] text-[#7C6A58] truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#8C7A68]" />
                  {event.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated Operations Status Breakdown Modal */}
      <OperationsStatusModal
        key={operationsModalType || 'closed'}
        isOpen={operationsModalType !== null}
        initialType={operationsModalType || 'PENDING'}
        onClose={() => setOperationsModalType(null)}
        onOpenNewTask={onOpenNewTask}
        onOpenQuickTask={onOpenQuickTask}
        onReassignTask={onReassignTask}
      />
    </div>
  );
}
