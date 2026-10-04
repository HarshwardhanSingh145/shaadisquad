'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { User, UserRole } from '@/lib/types';
import { sortMembersByDistance, calculateMemberDistance } from '@/lib/distance';
import { 
  Crown, 
  MapPin, 
  Compass, 
  UserCheck, 
  Trash2, 
  Shield, 
  Plus, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  EyeOff,
  Radio
} from 'lucide-react';

interface TeamViewProps {
  onAssignDirectTask: (member: User) => void;
  onOpenQuickTaskForMember: (member: User) => void;
  onSendVoiceNote?: (member: User) => void;
}

export function TeamView({ onAssignDirectTask, onOpenQuickTaskForMember, onSendVoiceNote }: TeamViewProps) {
  const { teamMembers, currentUser, updateMemberRole, removeMember, tasks, wedding } = useWedding();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  // Sort members by distance relative to current user
  const sortedMembers = sortMembersByDistance(teamMembers, currentUser);

  return (
    <div className="space-y-4 pb-24">
      {/* Header & View Mode Switcher */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-[#2B1E16] tracking-tight">
            Wedding Team
          </h1>
          <p className="text-xs text-[#7C6A58]">
            {teamMembers.length} active squad members
          </p>
        </div>

        {/* List vs Nearby View */}
        <div className="flex items-center p-1 bg-white rounded-xl border border-[#E8DFC8]">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-[#4A3525] text-white shadow-xs'
                : 'text-[#7C6A58] hover:text-[#2B1E16]'
            }`}
          >
            Team List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              viewMode === 'map'
                ? 'bg-[#4A3525] text-white shadow-xs'
                : 'text-[#7C6A58] hover:text-[#2B1E16]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Nearby
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: TEAM LIST */}
      {viewMode === 'list' && (
        <div className="space-y-2.5">
          {sortedMembers.map(({ member, distanceFormatted, isSharing }) => {
            const isMe = member.id === currentUser?.id;
            const isAvailable = member.availability === 'AVAILABLE';
            const memberTasks = tasks.filter(
              (t) => t.assignedUserId === member.id && t.status !== 'COMPLETED'
            );
            const activeTask = memberTasks[0];

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:shadow-xs ${
                  isMe
                    ? 'bg-[#FAF7F2] border-[#DECDB3]'
                    : 'bg-white border-[#E8DFC8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status Dot */}
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isAvailable ? 'bg-[#16A34A]' : 'bg-[#EA580C]'
                      }`}
                      title={isAvailable ? 'Available' : 'Busy with work'}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#2B1E16] truncate">
                          {member.name}
                        </span>
                        {member.role === 'ADMIN' && (
                          <span className="text-[10px] font-bold text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            👑 Admin
                          </span>
                        )}
                        {member.role === 'COORDINATOR' && (
                          <span className="text-[10px] font-semibold text-[#1E40AF] bg-[#DBEAFE] px-1.5 py-0.5 rounded-full">
                            Coordinator
                          </span>
                        )}
                        {isMe && (
                          <span className="text-[10px] text-[#7C6A58]">(You)</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#7C6A58] mt-0.5">
                        <span className={isAvailable ? 'text-[#15803D] font-medium' : 'text-[#C2410C] font-medium'}>
                          {isAvailable ? '🟢 Available' : '🟠 Busy'}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 text-[#5C4A3A]">
                          {isSharing ? (
                            <>
                              <MapPin className="w-3 h-3 text-[#7C6A58]" />
                              {distanceFormatted}
                            </>
                          ) : (
                            <span className="text-[#8C7A68]">Location hidden</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-semibold text-[#4A3525] bg-[#F5EFE6] px-2 py-1 rounded-lg">
                      {memberTasks.length} task{memberTasks.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Current Active Task Teaser */}
                {activeTask && (
                  <div className="mt-2.5 pt-2 border-t border-[#F2ECE1] text-[11px] text-[#5C4A3A] truncate flex items-center justify-between">
                    <span className="truncate">
                      Working on: <strong className="text-[#2B1E16]">{activeTask.title}</strong>
                    </span>
                    <span className="text-[10px] text-[#8C7A68] shrink-0 ml-2">
                      📍 {activeTask.location}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: NEARBY MAP / RADAR */}
      {viewMode === 'map' && (
        <div className="space-y-3">
          {/* Minimalist Venue Campus Layout */}
          <div className="bg-[#FAF7F2] rounded-3xl p-4 border border-[#DECDB3] shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#2B1E16] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#16A34A]" />
                Wedding Venue Proximity
              </span>
              <span className="text-[10px] font-semibold text-[#7C6A58]">
                Realtime distance
              </span>
            </div>

            {/* Radar / Campus Canvas */}
            <div className="relative w-full aspect-square max-h-64 rounded-2xl bg-[#F0EBE1] border border-[#DECDB3] flex items-center justify-center p-2 overflow-hidden">
              {/* Radar Rings */}
              <div className="absolute inset-8 rounded-full border border-[#D5C7B3] pointer-events-none" />
              <div className="absolute inset-20 rounded-full border border-[#DECDB3] pointer-events-none" />
              <div className="absolute w-2 h-2 rounded-full bg-[#4A3525] pointer-events-none" />

              {/* Venue Sector Labels */}
              <span className="absolute top-2 left-3 text-[9px] font-bold text-[#8C7A68] uppercase tracking-wider">
                Hotel Lobby
              </span>
              <span className="absolute top-2 right-3 text-[9px] font-bold text-[#8C7A68] uppercase tracking-wider">
                Mandap
              </span>
              <span className="absolute bottom-2 left-3 text-[9px] font-bold text-[#8C7A68] uppercase tracking-wider">
                Parking / Valet
              </span>
              <span className="absolute bottom-2 right-3 text-[9px] font-bold text-[#8C7A68] uppercase tracking-wider">
                Banquet Hall
              </span>

              {/* Plotted Member Pins */}
              {sortedMembers.map(({ member, distanceMeters, distanceFormatted, isSharing }, idx) => {
                if (!isSharing) return null;

                // Model coordinates radially based on distance
                const angle = (idx * (360 / Math.max(sortedMembers.length, 1)) * Math.PI) / 180;
                const normalizedRadius = Math.min(Math.max((distanceMeters / 1000) * 80 + 20, 25), 100);
                const x = 50 + (Math.cos(angle) * normalizedRadius * 0.4);
                const y = 50 + (Math.sin(angle) * normalizedRadius * 0.4);

                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center z-10 transition-transform active:scale-125 focus:outline-hidden"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md ring-2 ring-white ${
                        member.role === 'ADMIN'
                          ? 'bg-[#92400E]'
                          : member.availability === 'AVAILABLE'
                          ? 'bg-[#16A34A]'
                          : 'bg-[#EA580C]'
                      }`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <span className="mt-0.5 px-1.5 py-0.5 bg-white/95 rounded-md shadow-xs text-[9px] font-bold text-[#2B1E16] whitespace-nowrap border border-[#DECDB3]">
                      {member.name} ({distanceFormatted})
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-[#7C6A58] mt-2 text-center">
              Tap any member pin to assign work or view current tasks.
            </p>
          </div>

          {/* Sorted Proximity List */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#E8DFC8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C6A58] mb-2">
              Sorted by Proximity
            </h3>
            <div className="space-y-2">
              {sortedMembers.map(({ member, distanceFormatted, isSharing }) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF7F2] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${member.availability === 'AVAILABLE' ? 'bg-[#16A34A]' : 'bg-[#EA580C]'}`} />
                    <span className="font-bold text-[#2B1E16]">{member.name}</span>
                    <span className="text-[10px] text-[#7C6A58]">({member.role.toLowerCase()})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#4A3B2E]">
                      {isSharing ? distanceFormatted : 'Hidden'}
                    </span>
                    <button
                      onClick={() => onOpenQuickTaskForMember(member)}
                      className="px-2 py-1 rounded-lg bg-[#FAF0E6] text-[#4A3525] font-bold text-[10px] hover:bg-[#EFE6D5]"
                    >
                      Quick Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MEMBER DETAIL SHEET / MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setSelectedMember(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4A3525] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2B1E16] flex items-center gap-1.5">
                    {selectedMember.name}
                    {selectedMember.role === 'ADMIN' && <Crown className="w-3.5 h-3.5 text-[#D97706]" />}
                  </h3>
                  <p className="text-[11px] text-[#7C6A58] capitalize">
                    {selectedMember.role.toLowerCase()} · {selectedMember.availability.toLowerCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Distance & Venue Info */}
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#DECDB3] space-y-1.5 text-xs mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[#7C6A58]">Location status:</span>
                <span className="font-semibold text-[#2B1E16]">
                  {selectedMember.locationSharing ? (
                    <span className="text-[#15803D] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {calculateMemberDistance(selectedMember, currentUser).distanceFormatted}
                    </span>
                  ) : (
                    <span className="text-[#8C7A68]">Sharing paused</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7C6A58]">Venue Area:</span>
                <span className="font-semibold text-[#2B1E16]">
                  {selectedMember.currentVenueArea || 'Main Venue'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7C6A58]">Availability:</span>
                <span className="font-bold text-[#2B1E16]">
                  {selectedMember.availability === 'AVAILABLE' ? '🟢 Free for tasks' : '🟠 In progress'}
                </span>
              </div>
            </div>

            {/* Current Active Tasks for this member */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-[#2B1E16] mb-1.5">
                Current Tasks ({tasks.filter(t => t.assignedUserId === selectedMember.id && t.status !== 'COMPLETED').length})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {tasks
                  .filter((t) => t.assignedUserId === selectedMember.id && t.status !== 'COMPLETED')
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-2 rounded-xl bg-[#FAF7F2] border border-[#EFE7D8] text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-[#2B1E16] truncate">
                        {task.title}
                      </span>
                      <span className="text-[10px] font-semibold text-[#7C6A58] shrink-0 ml-1">
                        {task.dueTime}
                      </span>
                    </div>
                  ))}
                {tasks.filter(t => t.assignedUserId === selectedMember.id && t.status !== 'COMPLETED').length === 0 && (
                  <p className="text-xs text-[#7C6A58] italic py-1">
                    No active tasks assigned right now.
                  </p>
                )}
              </div>
            </div>

            {/* Actions for this member */}
            <div className="space-y-2 pt-2 border-t border-[#F2ECE1]">
              <button
                onClick={() => {
                  const m = selectedMember;
                  setSelectedMember(null);
                  onAssignDirectTask(m);
                }}
                className="w-full h-11 rounded-xl bg-[#4A3525] hover:bg-[#382618] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Assign Work to {selectedMember.name}
              </button>

              {onSendVoiceNote && selectedMember.id !== currentUser?.id && (
                <button
                  onClick={() => {
                    const m = selectedMember;
                    setSelectedMember(null);
                    onSendVoiceNote(m);
                  }}
                  className="w-full h-11 rounded-xl bg-[#FAF0E6] hover:bg-[#F3E5D4] text-[#4A3525] font-bold text-xs border border-[#DECDB3] transition-all flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-4 h-4 text-[#DC2626]" />
                  Send Voice Note to {selectedMember.name}
                </button>
              )}

              {/* Admin-only controls */}
              {isAdmin && selectedMember.role !== 'ADMIN' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selectedMember.role === 'MEMBER' ? (
                    <button
                      onClick={() => {
                        updateMemberRole(selectedMember.id, 'COORDINATOR');
                        setSelectedMember(null);
                      }}
                      className="py-2 px-2 text-xs font-bold rounded-xl border border-[#DECDB3] bg-[#FAF7F2] text-[#4A3525] hover:bg-[#F3EDE2] transition-colors"
                    >
                      Promote to Coordinator
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        updateMemberRole(selectedMember.id, 'MEMBER');
                        setSelectedMember(null);
                      }}
                      className="py-2 px-2 text-xs font-semibold rounded-xl border border-[#DECDB3] bg-[#FAF7F2] text-[#7C6A58] hover:bg-[#F3EDE2] transition-colors"
                    >
                      Set as Team Member
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Remove ${selectedMember.name} from this wedding squad?`)) {
                        removeMember(selectedMember.id);
                        setSelectedMember(null);
                      }
                    }}
                    className="py-2 px-2 text-xs font-bold rounded-xl border border-[#FECACA] bg-[#FFF5F5] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
