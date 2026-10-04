'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { User } from '@/lib/types';
import { playMicChirp } from '@/lib/sound';
import { X, Mic, Square, Play, Pause, Send, Radio, Users, Check, AlertCircle } from 'lucide-react';

interface VoiceNoteRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipientId?: string; // Optional target member
}

export function VoiceNoteRecorderModal({
  isOpen,
  onClose,
  defaultRecipientId = 'ALL',
}: VoiceNoteRecorderModalProps) {
  const { teamMembers, currentUser, sendVoiceNote } = useWedding();
  const [recipientId, setRecipientId] = useState(defaultRecipientId);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Stop media on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setAudioUrl(null);
    setIsPlayingPreview(false);
    setTranscription('');
    setMicError(null);
    onClose();
  };

  if (!isOpen) return null;

  // Start real recording or fallback
  const startRecording = async () => {
    playMicChirp();
    setAudioUrl(null);
    setMicError(null);
    setRecordingSeconds(0);

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            setAudioUrl(reader.result as string);
          };
          // Stop stream tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        throw new Error('Microphone not supported');
      }
    } catch {
      // Fallback to simulated voice note
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    playMicChirp();
    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorderRef.current && isRecording && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (!audioUrl) {
      // Mock audio url fallback
      setAudioUrl('simulated-voice-note');
    }
    setIsRecording(false);
  };

  const togglePreview = () => {
    if (!audioUrl) return;

    if (audioUrl === 'simulated-voice-note') {
      // Play web audio tone simulation
      setIsPlayingPreview(true);
      playMicChirp();
      setTimeout(() => setIsPlayingPreview(false), (recordingSeconds || 3) * 1000);
      return;
    }

    if (audioPreviewRef.current) {
      if (isPlayingPreview) {
        audioPreviewRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        audioPreviewRef.current.play();
        setIsPlayingPreview(true);
      }
    }
  };

  const handleSend = () => {
    const finalDuration = Math.max(recordingSeconds, 2);
    sendVoiceNote({
      recipientId,
      audioUrl: audioUrl || 'simulated-voice-note',
      durationSeconds: finalDuration,
      transcription: transcription.trim() || undefined,
    });
    handleClose();
  };

  const targetMember = teamMembers.find((m) => m.id === recipientId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={handleClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#4A3525] text-white flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B1E16]">Send Voice Note</h2>
              <p className="text-[11px] text-[#7C6A58]">Quick walkie-talkie coordination</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipient Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#2B1E16] mb-1.5 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#7C6A58]" />
            Send Voice Note To:
          </label>
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            disabled={isRecording}
            className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs font-semibold text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
          >
            <option value="ALL">📢 Whole Squad (Broadcast to Everyone)</option>
            {teamMembers
              .filter((m) => m.id !== currentUser?.id)
              .map((member) => (
                <option key={member.id} value={member.id}>
                  👤 {member.name} ({member.role.toLowerCase()}) — {member.availability}
                </option>
              ))}
          </select>
        </div>

        {/* Recorder Central Area */}
        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB3] flex flex-col items-center justify-center text-center my-3 relative overflow-hidden">
          {/* Animated sound waves when recording */}
          {isRecording && (
            <div className="flex items-center gap-1.5 h-8 mb-3">
              {[0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.3, 0.7, 1, 0.4].map((scale, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#DC2626] rounded-full animate-pulse"
                  style={{
                    height: `${scale * 28}px`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: '600ms',
                  }}
                />
              ))}
            </div>
          )}

          {/* Timer Display */}
          <div className="font-mono text-2xl font-bold text-[#2B1E16] mb-1 tabular-nums">
            00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
          </div>

          <p className="text-[11px] text-[#7C6A58] mb-4">
            {isRecording
              ? 'Recording voice note... tap to finish'
              : audioUrl
              ? 'Voice note recorded! Review or send below'
              : 'Tap microphone to start speaking'}
          </p>

          {/* Record Button */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-[#4A3525] hover:bg-[#382618] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all group"
              title="Start recording"
            >
              <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center shadow-lg shadow-[#DC2626]/30 animate-pulse active:scale-95 transition-all"
              title="Stop recording"
            >
              <Square className="w-6 h-6 fill-current" />
            </button>
          )}

          {/* Audio preview element if real recorded blob */}
          {audioUrl && audioUrl !== 'simulated-voice-note' && (
            <audio
              ref={audioPreviewRef}
              src={audioUrl}
              onEnded={() => setIsPlayingPreview(false)}
              className="hidden"
            />
          )}
        </div>

        {/* Optional preview & summary text */}
        {audioUrl && !isRecording && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Playback preview trigger */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePreview}
                  className="w-8 h-8 rounded-full bg-[#4A3525] text-white flex items-center justify-center shadow-xs hover:bg-[#382618]"
                >
                  {isPlayingPreview ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <span className="text-xs font-semibold text-[#2B1E16]">
                  {isPlayingPreview ? 'Playing preview...' : 'Listen to preview'}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#7C6A58]">
                {recordingSeconds}s
              </span>
            </div>

            {/* Quick Note / Summary */}
            <div>
              <label className="block text-[11px] font-bold text-[#2B1E16] mb-1">
                Quick Summary (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Bring 2 chairs to Mandap"
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3">
          {audioUrl && !isRecording ? (
            <button
              onClick={handleSend}
              className="w-full h-12 rounded-xl bg-[#4A3525] hover:bg-[#382618] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Voice Note {recipientId === 'ALL' ? 'to Squad' : `to ${targetMember?.name || 'Teammate'}`}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 text-xs font-semibold text-[#7C6A58] hover:text-[#2B1E16]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
