'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { sortMembersByDistance } from '@/lib/distance';
import { X, UserCheck, Check, Compass } from 'lucide-react';
import { Task } from '@/lib/types';

interface ReassignModalProps {
  task: Task | null;
  onClose: () => void;
}

export function ReassignModal({ task, onClose }: ReassignModalProps) {
  const { teamMembers, currentUser, reassignTask } = useWedding();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  if (!task) return null;

  // Exclude current assignee and sort by distance from current user
  const sortedCandidates = sortMembersByDistance(teamMembers, currentUser, task.assignedUserId);
  const activeSelected = selectedUserId || sortedCandidates[0]?.member.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSelected) return;

    reassignTask(task.id, activeSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A3525] text-white flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B1E16]">Reassign Task</h3>
              <p className="text-[11px] text-[#7C6A58]">Pick new member to take over</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#DECDB3] mb-3 text-xs">
          <p className="text-[#7C6A58]">Task to reassign:</p>
          <p className="font-bold text-[#2B1E16] mt-0.5">{task.title}</p>
          <p className="text-[11px] text-[#8C7A68] mt-0.5">Currently assigned to: {task.assignedUserName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#2B1E16]">
              Select new member:
            </label>
            <span className="text-[10px] text-[#7C6A58] flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#16A34A]" /> Sorted by proximity
            </span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {sortedCandidates.map(({ member, distanceFormatted, isSharing }) => {
              const isSelected = activeSelected === member.id;
              const isAvailable = member.availability === 'AVAILABLE';

              return (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => setSelectedUserId(member.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#4A3525] text-white border-[#4A3525]'
                      : 'bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#2B1E16] border-[#DECDB3]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isAvailable ? 'bg-[#16A34A]' : 'bg-[#EA580C]'
                    }`} />
                    <div className="truncate">
                      <span className="text-xs font-bold truncate block">{member.name}</span>
                      <span className={`text-[10px] block truncate ${isSelected ? 'text-white/80' : 'text-[#7C6A58]'}`}>
                        {isSharing ? `📍 ${distanceFormatted}` : '📍 Hidden'} · {member.role}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#4A3525] hover:bg-[#382618] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              Confirm Reassignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
