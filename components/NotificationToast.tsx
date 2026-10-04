'use client';

import React from 'react';
import { useWedding } from '@/lib/wedding-context';
import { Bell, AlertCircle, CheckCircle2, UserPlus, X, Zap, Radio } from 'lucide-react';

export function NotificationToast({
  onOpenTask,
  onOpenVoiceNotes,
}: {
  onOpenTask?: (taskId: string) => void;
  onOpenVoiceNotes?: () => void;
}) {
  const { activeNotification, dismissNotification } = useWedding();

  if (!activeNotification) return null;

  const isUrgent =
    activeNotification.type === 'QUICK_TASK' ||
    activeNotification.type === 'HELP_REQUEST' ||
    activeNotification.type === 'VOICE_NOTE';

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-top-4 duration-200">
      <div
        className={`p-3.5 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 ${
          isUrgent
            ? 'bg-[#FFF5F5] border-[#FCA5A5] text-[#7F1D1D]'
            : 'bg-[#FAF8F5] border-[#E8DCC8] text-[#3D2B1E]'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            activeNotification.type === 'QUICK_TASK'
              ? 'bg-[#EF4444] text-white'
              : activeNotification.type === 'HELP_REQUEST'
              ? 'bg-[#F97316] text-white'
              : activeNotification.type === 'VOICE_NOTE'
              ? 'bg-[#EA580C] text-white'
              : activeNotification.type === 'APPROVED'
              ? 'bg-[#15803D] text-white'
              : activeNotification.type === 'JOIN_REQUEST'
              ? 'bg-[#854D0E] text-white'
              : 'bg-[#4A3525] text-white'
          }`}
        >
          {activeNotification.type === 'QUICK_TASK' && <Zap className="w-5 h-5 fill-current" />}
          {activeNotification.type === 'HELP_REQUEST' && <AlertCircle className="w-5 h-5" />}
          {activeNotification.type === 'VOICE_NOTE' && <Radio className="w-5 h-5" />}
          {activeNotification.type === 'APPROVED' && <CheckCircle2 className="w-5 h-5" />}
          {activeNotification.type === 'JOIN_REQUEST' && <UserPlus className="w-5 h-5" />}
          {activeNotification.type === 'NEW_TASK' && <Bell className="w-5 h-5" />}
          {activeNotification.type === 'REASSIGNED' && <Bell className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold tracking-tight uppercase">
              {activeNotification.title}
            </h4>
            <span className="text-[10px] opacity-60">Just now</span>
          </div>
          <p className="text-xs mt-0.5 line-clamp-2 leading-relaxed opacity-90">
            {activeNotification.message}
          </p>

          {activeNotification.type === 'VOICE_NOTE' && onOpenVoiceNotes && (
            <button
              onClick={() => {
                onOpenVoiceNotes();
                dismissNotification(activeNotification.id);
              }}
              className="mt-2 text-[11px] font-bold text-[#EA580C] underline underline-offset-2 hover:opacity-80 flex items-center gap-1"
            >
              Listen to Voice Note &rarr;
            </button>
          )}

          {activeNotification.taskId && onOpenTask && (
            <button
              onClick={() => {
                if (activeNotification.taskId) onOpenTask(activeNotification.taskId);
                dismissNotification(activeNotification.id);
              }}
              className="mt-2 text-[11px] font-semibold underline underline-offset-2 hover:opacity-80"
            >
              View Task &rarr;
            </button>
          )}
        </div>

        <button
          onClick={() => dismissNotification(activeNotification.id)}
          className="p-1 rounded-lg hover:bg-black/5 text-current/60 hover:text-current transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
