'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { sortMembersByDistance } from '@/lib/distance';
import { X, Zap, MapPin, Clock, Compass, Check, AlertCircle } from 'lucide-react';

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickTaskModal({ isOpen, onClose }: QuickTaskModalProps) {
  const { teamMembers, currentUser, createQuickTask } = useWedding();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Hotel Lobby');
  const [urgency, setUrgency] = useState<'ASAP' | 'Within 15 min' | 'Within 30 min'>('ASAP');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showNearbyView, setShowNearbyView] = useState(false);

  if (!isOpen) return null;

  // Sort members by proximity to current user
  const sortedMembers = sortMembersByDistance(teamMembers, currentUser);

  // Default selection to first available or nearby
  const activeSelectedUser = selectedUserId || sortedMembers.find(m => m.member.availability === 'AVAILABLE')?.member.id || sortedMembers[0]?.member.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeSelectedUser) return;

    createQuickTask({
      title: title.trim(),
      assignedUserId: activeSelectedUser,
      dueTime: urgency,
      location: location.trim() || 'Wedding Venue',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#DC2626] text-white flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B1E16]">Assign Quick Task</h2>
              <p className="text-[11px] text-[#7C6A58]">For urgent work arising right now</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question 1: What needs to be done? */}
          <div>
            <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">
              What needs to be done?
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Photographer has arrived. Guide to room."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-sm text-[#2B1E16] placeholder:text-[#9C8A79] focus:outline-hidden focus:border-[#4A3525] focus:ring-1 focus:ring-[#4A3525]"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-[#2B1E16] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#7C6A58]" />
              Location
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {['Hotel Lobby', 'Mandap Ground', 'Guest Rooms'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setLocation(preset)}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border text-center transition-all truncate ${
                    location === preset
                      ? 'bg-[#4A3525] text-white border-[#4A3525]'
                      : 'bg-[#FAF7F2] text-[#5C4A3A] border-[#DECDB3] hover:bg-[#F3EDE2]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or custom location (e.g. Dining Hall Counter)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
            />
          </div>

          {/* Question 2: How urgent? */}
          <div>
            <label className="block text-xs font-bold text-[#2B1E16] mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#DC2626]" />
              How urgent?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ASAP', 'Within 15 min', 'Within 30 min'] as const).map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setUrgency(opt)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                    urgency === opt
                      ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-sm'
                      : 'bg-[#FFF8F8] text-[#991B1B] border-[#FECACA] hover:bg-[#FEE2E2]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Who should handle it? */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#2B1E16]">
                Who should handle it?
              </label>
              <button
                type="button"
                onClick={() => setShowNearbyView(!showNearbyView)}
                className="text-[11px] font-bold text-[#4A3525] hover:underline flex items-center gap-1"
              >
                <Compass className="w-3.5 h-3.5 text-[#16A34A]" />
                {showNearbyView ? 'Show All' : 'Find Nearby'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {sortedMembers.map(({ member, distanceFormatted, isSharing }) => {
                const isSelected = activeSelectedUser === member.id;
                const isAvailable = member.availability === 'AVAILABLE';

                return (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => setSelectedUserId(member.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#4A3525] text-white border-[#4A3525] shadow-xs'
                        : 'bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#2B1E16] border-[#DECDB3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isAvailable ? 'bg-[#16A34A]' : 'bg-[#EA580C]'
                      }`} />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">{member.name}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#7C6A58]'}`}>
                            ({member.role === 'ADMIN' ? 'Admin' : member.role === 'COORDINATOR' ? 'Coord' : 'Team'})
                          </span>
                        </div>
                        <p className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-[#7C6A58]'}`}>
                          {isSharing ? `📍 ${distanceFormatted}` : '📍 Location hidden'} · {isAvailable ? 'Available' : 'Busy'}
                        </p>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full h-12 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#DC2626]/20 active:scale-[0.98] transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              Assign Quick Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
