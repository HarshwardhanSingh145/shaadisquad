'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { Bell, Users, ChevronDown, Check, ShieldCheck, Radio } from 'lucide-react';

interface TopHeaderProps {
  onOpenVoiceNotes?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export function TopHeader({ onOpenVoiceNotes, onOpenVoiceAssistant }: TopHeaderProps) {
  const { wedding, currentUser, teamMembers, switchUser, voiceNotes } = useWedding();
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!wedding) return null;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC8]/60 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Zone 1: Brand / Wedding Wordmark */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black tracking-tight text-[#2B1E16]">
              Shaadi Squad
            </span>
            <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded-md border border-[#FDE68A]/60">
              शादी स्क्वॉड
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#7C6A58] block truncate">
            {wedding.name} · Day {wedding.dayNumber}
          </span>
        </div>

        {/* Zone 2 & 3: Voice Notes, Live AI & Fast Persona Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live Voice Assistant (gemini-3.8-live) Button */}
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#4A3525] hover:bg-[#382618] text-white text-xs font-bold shadow-xs transition-colors"
              title="Open Live Voice Dispatcher (gemini-3.8-live)"
            >
              <span className="text-xs">🎙️</span>
              <span className="hidden xs:inline">Live AI</span>
            </button>
          )}

          {/* Walkie-Talkie / Voice Notes Button */}
          {onOpenVoiceNotes && (
            <button
              onClick={onOpenVoiceNotes}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FAF0E6] hover:bg-[#F3E5D4] text-[#4A3525] text-xs font-bold border border-[#DECDB3] transition-colors relative"
              title="Open Voice Notes Dashboard"
            >
              <Radio className="w-3.5 h-3.5 text-[#DC2626]" />
              <span className="hidden xs:inline">Walkie</span>
              <span className="w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center -mr-1">
                {voiceNotes.length}
              </span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#EFE6D5] hover:bg-[#E5D9C4] text-[#3D2B1E] text-xs font-semibold transition-all border border-[#DECDB3]"
              title="Switch user to test different roles"
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
              <span className="max-w-[70px] truncate">{currentUser?.name}</span>
              <span className="text-[10px] text-[#7C6A58]">
                {currentUser?.role === 'ADMIN' ? '👑' : currentUser?.role === 'COORDINATOR' ? '📋' : '🏃'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7C6A58]" />
            </button>

            {/* Fast Persona Switcher Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-[#E8DFC8] p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-2.5 py-2 border-b border-[#F0EAE1]">
                    <p className="text-[10px] font-semibold text-[#8C7A68] uppercase tracking-wider">
                      Switch Role for Testing
                    </p>
                    <p className="text-xs text-[#5C4A3A] mt-0.5">
                      Test multi-user realtime permissions:
                    </p>
                  </div>
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          switchUser(member.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                          currentUser?.id === member.id
                            ? 'bg-[#F5EFE6] font-semibold text-[#2B1E16]'
                            : 'hover:bg-[#FAF7F2] text-[#4A3B2E]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm">
                            {member.role === 'ADMIN' ? '👑' : member.role === 'COORDINATOR' ? '📋' : '🏃'}
                          </span>
                          <div className="truncate">
                            <span className="block truncate font-medium text-xs">
                              {member.name}
                            </span>
                            <span className="block text-[10px] text-[#8C7A68] capitalize">
                              {member.role.toLowerCase()}
                            </span>
                          </div>
                        </div>
                        {currentUser?.id === member.id && (
                          <Check className="w-4 h-4 text-[#4A3525] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
