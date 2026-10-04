'use client';

import React, { useState, useRef } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { VoiceNote } from '@/lib/types';
import { playMicChirp } from '@/lib/sound';
import { 
  Radio, 
  X, 
  Play, 
  Pause, 
  Mic, 
  Trash2, 
  Users, 
  Volume2, 
  MessageSquare,
  Crown,
  Share2,
  CornerDownRight
} from 'lucide-react';

interface VoiceNotesDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecorder: (recipientId?: string) => void;
}

type TabType = 'all' | 'broadcasts' | 'direct' | 'sent';

export function VoiceNotesDashboardModal({
  isOpen,
  onClose,
  onOpenRecorder,
}: VoiceNotesDashboardModalProps) {
  const { voiceNotes, currentUser, deleteVoiceNote } = useWedding();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'ADMIN';

  // Filter voice notes
  const filteredNotes = voiceNotes.filter((note) => {
    if (activeTab === 'broadcasts') return note.recipientId === 'ALL';
    if (activeTab === 'direct') return note.recipientId === currentUser?.id;
    if (activeTab === 'sent') return note.senderId === currentUser?.id;
    return true; // 'all'
  });

  const stopPlayback = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setPlayingId(null);
    setPlaybackProgress(0);
  };

  const handlePlay = (note: VoiceNote) => {
    if (playingId === note.id) {
      stopPlayback();
      return;
    }

    stopPlayback();
    setPlayingId(note.id);
    playMicChirp();

    if (note.audioUrl && note.audioUrl !== 'simulated-voice-note') {
      const audio = new Audio(note.audioUrl);
      activeAudioRef.current = audio;
      audio.play().catch(() => {});

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setPlaybackProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        stopPlayback();
      };
    } else {
      // Synthetic playback timer
      const totalMs = Math.max(note.durationSeconds * 1000, 3000);
      const start = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const progress = Math.min((elapsed / totalMs) * 100, 100);
        setPlaybackProgress(progress);
        if (progress >= 100) {
          stopPlayback();
        }
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#4A3525] text-white flex items-center justify-center shadow-xs">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B1E16] flex items-center gap-1.5">
                Voice Notes & Walkie
                <span className="text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] px-1.5 py-0.2 rounded-full">
                  Live
                </span>
              </h2>
              <p className="text-[11px] text-[#7C6A58]">Har kaam, sahi waqt · Audio coordination</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-2xl border border-[#DECDB3] mb-3 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'broadcasts', label: '📢 Broadcasts' },
            { id: 'direct', label: 'To Me' },
            { id: 'sent', label: 'Sent by Me' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                stopPlayback();
              }}
              className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap text-center ${
                activeTab === tab.id
                  ? 'bg-[#4A3525] text-white shadow-xs'
                  : 'text-[#7C6A58] hover:text-[#2B1E16]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Voice Notes List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
          {filteredNotes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#FAF7F2] border border-[#DECDB3] text-center my-6">
              <Volume2 className="w-8 h-8 text-[#8C7A68] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-[#2B1E16]">No voice notes here yet</p>
              <p className="text-[11px] text-[#7C6A58] mt-0.5">
                Send a quick audio message to coordinate your squad instantly.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isPlaying = playingId === note.id;
              const isFromMe = note.senderId === currentUser?.id;
              const isBroadcast = note.recipientId === 'ALL';

              return (
                <div
                  key={note.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isPlaying
                      ? 'bg-[#FFF8F0] border-[#FDBA74] shadow-xs ring-1 ring-[#EA580C]/20'
                      : isBroadcast
                      ? 'bg-[#FAF7F2] border-[#DECDB3]'
                      : 'bg-white border-[#E8DFC8]'
                  }`}
                >
                  {/* Top Meta: Sender and Recipient */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#4A3525] text-white text-xs font-bold flex items-center justify-center">
                        {note.senderName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#2B1E16]">
                            {isFromMe ? `${note.senderName} (You)` : note.senderName}
                          </span>
                          <span className="text-[10px] text-[#7C6A58]">
                            ({note.senderRole.toLowerCase()})
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8C7A68]">
                          {isBroadcast ? '📢 Broadcast to Squad' : `Direct to ${note.recipientName}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono font-semibold text-[#7C6A58]">
                        {note.durationSeconds}s
                      </span>
                      {(isFromMe || isAdmin) && (
                        <button
                          onClick={() => deleteVoiceNote(note.id)}
                          className="p-1 text-[#8C7A68] hover:text-[#DC2626] transition-colors"
                          title="Delete voice note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audio Player Row */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-[#DECDB3]">
                    <button
                      onClick={() => handlePlay(note)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs transition-all shrink-0 ${
                        isPlaying
                          ? 'bg-[#DC2626] text-white shadow-[#DC2626]/30'
                          : 'bg-[#4A3525] text-white hover:bg-[#382618]'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Waveform Visualization */}
                    <div className="flex-1 flex items-center gap-1 h-6">
                      {[0.3, 0.7, 1, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.8, 0.5, 1, 0.6, 0.4].map(
                        (h, i) => {
                          const isActive = isPlaying && (i / 14) * 100 <= playbackProgress;
                          return (
                            <span
                              key={i}
                              className={`flex-1 rounded-full transition-all ${
                                isActive ? 'bg-[#DC2626]' : 'bg-[#D5C7B3]'
                              }`}
                              style={{ height: `${h * 20}px` }}
                            />
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Transcription / Note */}
                  {note.transcription && (
                    <p className="text-xs text-[#4A3B2E] mt-2 italic px-1 leading-relaxed">
                      &ldquo;{note.transcription}&rdquo;
                    </p>
                  )}

                  {/* Reply Button (if sent to me or broadcast and not from me) */}
                  {!isFromMe && (
                    <div className="mt-2.5 pt-2 border-t border-[#F2ECE1] flex justify-end">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenRecorder(note.senderId);
                        }}
                        className="text-[11px] font-bold text-[#4A3525] hover:underline flex items-center gap-1"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        Reply to {note.senderName}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Primary Action */}
        <div className="pt-3 border-t border-[#F2ECE1] shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenRecorder('ALL');
            }}
            className="w-full h-12 rounded-xl bg-[#4A3525] hover:bg-[#382618] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Record Voice Note
          </button>
        </div>
      </div>
    </div>
  );
}
