'use client';

import React, { useState } from 'react';
import { Calendar, CheckSquare, Users, User, Plus, Zap, ClipboardList, X, Compass } from 'lucide-react';
import { useWedding } from '@/lib/wedding-context';

export type NavTab = 'today' | 'tasks' | 'team' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewTask: () => void;
  onOpenQuickTask: () => void;
  onOpenLiveLocationAssign: () => void;
}

export function BottomNav({
  currentTab,
  onSelectTab,
  onOpenNewTask,
  onOpenQuickTask,
  onOpenLiveLocationAssign,
}: BottomNavProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const { currentUser, joinRequests, tasks } = useWedding();

  const isLeader = currentUser?.role === 'ADMIN' || currentUser?.role === 'COORDINATOR';
  const pendingRequestsCount = currentUser?.role === 'ADMIN' ? joinRequests.filter(r => r.status === 'PENDING').length : 0;
  const myUrgentTasksCount = tasks.filter(t => t.assignedUserId === currentUser?.id && t.priority === 'URGENT' && t.status !== 'COMPLETED').length;

  return (
    <>
      {/* Popover Action Menu for prominent ＋ button */}
      {showAddMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setShowAddMenu(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-4 shadow-2xl border border-[#E8DFC8] space-y-3 z-10 animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between px-2 pt-1">
              <div>
                <h3 className="text-sm font-bold text-[#2B1E16]">Create Work</h3>
                <p className="text-[11px] text-[#7C6A58]">Har kaam, sahi insaan, sahi waqt</p>
              </div>
              <button
                onClick={() => setShowAddMenu(false)}
                className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {/* Option 1: See Live Location & Assign Work */}
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  onOpenLiveLocationAssign();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#86EFAC] text-left transition-all group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#14532D]">
                      See Live Location &amp; Assign Work
                    </span>
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                      Live GPS
                    </span>
                  </div>
                  <p className="text-xs text-[#166534] mt-0.5 line-clamp-1">
                    Live radar &amp; assign hand-to-hand to anyone
                  </p>
                </div>
              </button>

              {/* Quick Task option (Urgent) */}
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  onOpenQuickTask();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#FFF5F5] hover:bg-[#FEE2E2] border border-[#FCA5A5]/60 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#991B1B]">Quick Task</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FEE2E2] text-[#B91C1C]">
                      Urgent Work
                    </span>
                  </div>
                  <p className="text-xs text-[#7F1D1D] mt-0.5 line-clamp-1">
                    Newly arising work · Find nearby member instantly
                  </p>
                </div>
              </button>

              {/* Standard New Task option */}
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  onOpenNewTask();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#E8DFC8] text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#4A3525] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-[#2B1E16]">New Task</span>
                  <p className="text-xs text-[#7C6A58] mt-0.5 line-clamp-1">
                    Assign scheduled work with time and location
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main 4-Tab Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DFC8] pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-2">
          {/* Tab 1: Today */}
          <button
            onClick={() => onSelectTab('today')}
            className={`flex flex-col items-center justify-center py-1 transition-colors relative min-h-[48px] ${
              currentTab === 'today' ? 'text-[#3D2B1E] font-bold' : 'text-[#8C7A68] hover:text-[#5C4A3A]'
            }`}
          >
            <Calendar className={`w-5 h-5 ${currentTab === 'today' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Today</span>
            {myUrgentTasksCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#DC2626]" />
            )}
          </button>

          {/* Tab 2: Tasks */}
          <button
            onClick={() => onSelectTab('tasks')}
            className={`flex flex-col items-center justify-center py-1 transition-colors relative min-h-[48px] ${
              currentTab === 'tasks' ? 'text-[#3D2B1E] font-bold' : 'text-[#8C7A68] hover:text-[#5C4A3A]'
            }`}
          >
            <CheckSquare className={`w-5 h-5 ${currentTab === 'tasks' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Tasks</span>
          </button>

          {/* Center Prominent ＋ Action Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setShowAddMenu(true)}
              className="w-12 h-12 rounded-full bg-[#4A3525] text-white flex items-center justify-center shadow-lg shadow-[#4A3525]/25 hover:bg-[#382618] active:scale-95 transition-all focus:outline-hidden"
              aria-label="Create Work"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 3: Team */}
          <button
            onClick={() => onSelectTab('team')}
            className={`flex flex-col items-center justify-center py-1 transition-colors relative min-h-[48px] ${
              currentTab === 'team' ? 'text-[#3D2B1E] font-bold' : 'text-[#8C7A68] hover:text-[#5C4A3A]'
            }`}
          >
            <Users className={`w-5 h-5 ${currentTab === 'team' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Team</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#DC2626]" />
            )}
          </button>

          {/* Tab 4: Profile */}
          <button
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center justify-center py-1 transition-colors relative min-h-[48px] ${
              currentTab === 'profile' ? 'text-[#3D2B1E] font-bold' : 'text-[#8C7A68] hover:text-[#5C4A3A]'
            }`}
          >
            <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}
