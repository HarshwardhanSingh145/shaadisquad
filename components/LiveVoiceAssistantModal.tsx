'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { playMicChirp } from '@/lib/sound';
import { 
  Radio, 
  X, 
  Mic, 
  Square, 
  Volume2, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Clock,
  VolumeX,
  Play
} from 'lucide-react';

interface LiveVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioBase64?: string;
  timestamp: string;
}

export function LiveVoiceAssistantModal({
  isOpen,
  onClose,
}: LiveVoiceAssistantModalProps) {
  const { wedding, currentUser, tasks, teamMembers, timeline } = useWedding();
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: 'Shaadi Squad Radio AI online! Press the mic or ask anything about tasks, vendors, or timeline.',
      timestamp: 'Now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const recognitionRef = useRef<unknown>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio and recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch {}
      }
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
    };
  }, []);

  const handleClose = () => {
    if (recognitionRef.current && isListening) {
      try {
        (recognitionRef.current as { stop: () => void }).stop();
      } catch {}
    }
    setIsListening(false);
    setIsThinking(false);
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsPlayingAudio(false);
    onClose();
  };

  if (!isOpen) return null;

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsPlayingAudio(false);
      }
    }
  };

  const playVoiceResponse = (text: string, base64Audio?: string) => {
    try {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      if (base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        activeAudioRef.current = audio;
        setIsPlayingAudio(true);
        audio.play().catch(() => {
          speakText(text);
        });
        audio.onended = () => setIsPlayingAudio(false);
      } else {
        speakText(text);
      }
    } catch {
      speakText(text);
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    const p = promptText.trim();
    if (!p || isThinking) return;

    setInputText('');
    playMicChirp();

    const userMsg: MessageItem = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: p,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: p,
          weddingContext: {
            name: wedding?.name,
            coupleName: wedding?.coupleName,
            dayNumber: wedding?.dayNumber,
            date: wedding?.date,
            currentUserName: currentUser?.name,
            currentUserRole: currentUser?.role,
            totalTasks: tasks.length,
            pendingTasks: pendingCount,
          },
        }),
      });

      if (!res.ok) {
        let errMessage = 'Failed to get response';
        try {
          const errData = await res.json();
          if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const data = await res.json();
      const reply = data.text || 'Copy that, operational update acknowledged.';
      const assistantMsg: MessageItem = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        audioBase64: data.audioBase64 || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      playVoiceResponse(reply, data.audioBase64);
    } catch (err: unknown) {
      console.warn('Voice assistant warning:', err);
      const fallbackMsg: MessageItem = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Radio transmission static cleared. Operational update received. Standing by on squad channel.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setIsThinking(false);
    }
  };

  // Toggle browser speech recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      // Fallback: prompt user to use quick actions or type
      handleSendPrompt('What are my active tasks right now?');
      return;
    }

    try {
      // @ts-ignore
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.lang = 'en-IN'; // Indian English / Hindi mix
      recognition.continuous = false;
      recognition.interimResults = false;

      playMicChirp();
      setIsListening(true);

      recognition.onresult = (event: { results: { [x: string]: { [x: string]: { transcript: string } } } }) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleSendPrompt(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const sampleVoicePrompts = [
    'What tasks are pending for me?',
    'What is next on the schedule?',
    'Draft a quick broadcast that dinner is served',
    'Who is available near Mandap right now?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#4A3525] text-white flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 text-[#FDE68A]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-[#2B1E16]">Live Voice Dispatch</h2>
                <span className="text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] px-1.5 py-0.2 rounded-full">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[11px] text-[#7C6A58]">Hands-free conversational wedding coordinator</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Central Audio Visualizer Orb */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DECDB3] flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
                isListening
                  ? 'bg-[#DC2626] text-white scale-105 shadow-[#DC2626]/40 animate-pulse'
                  : isThinking
                  ? 'bg-[#EA580C] text-white animate-spin'
                  : 'bg-[#4A3525] text-white hover:bg-[#382618]'
              }`}
              title={isListening ? 'Tap to stop' : 'Tap to speak'}
            >
              {isListening ? (
                <Square className="w-5 h-5 fill-current" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <div>
              <span className="text-xs font-bold text-[#2B1E16] block">
                {isListening
                  ? 'Listening to your voice...'
                  : isThinking
                  ? 'Radio AI thinking...'
                  : isPlayingAudio
                  ? 'Speaking aloud 🔊'
                  : 'Tap Mic to Speak to AI'}
              </span>
              <span className="text-[11px] text-[#7C6A58]">
                {isListening
                  ? 'Speak clearly in English or Hindi'
                  : 'Instant live answers & squad assistance'}
              </span>
            </div>
          </div>

          {/* Sound waves animation */}
          {(isListening || isPlayingAudio) && (
            <div className="flex items-center gap-1 h-6">
              {[0.4, 0.9, 0.6, 1, 0.5, 0.8].map((s, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#4A3525] rounded-full animate-pulse"
                  style={{
                    height: `${s * 22}px`,
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sample Prompt Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 no-scrollbar">
          {sampleVoicePrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendPrompt(p)}
              disabled={isThinking}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#FAF7F2] text-[#4A3B2E] border border-[#DECDB3] hover:bg-[#F3EDE2] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              &ldquo;{p}&rdquo;
            </button>
          ))}
        </div>

        {/* Dialogue Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[180px] my-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[88%] ${
                m.sender === 'user'
                  ? 'ml-auto bg-[#4A3525] text-white rounded-tr-xs'
                  : 'mr-auto bg-[#FAF7F2] text-[#2B1E16] border border-[#DECDB3] rounded-tl-xs shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1 opacity-80 text-[10px]">
                <span className="font-bold flex items-center gap-1">
                  {m.sender === 'user' ? '👤 You' : '📻 Radio AI'}
                </span>
                <span>{m.timestamp}</span>
              </div>
              <p>{m.text}</p>

              {m.sender === 'assistant' && (
                <button
                  type="button"
                  onClick={() => playVoiceResponse(m.text, m.audioBase64)}
                  className="mt-2 text-[10px] font-bold text-[#EA580C] bg-white px-2 py-1 rounded-md border border-[#FDBA74] flex items-center gap-1 hover:bg-[#FFF7ED] transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" /> Play Voice Again
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Text Input Row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputText);
          }}
          className="pt-2 border-t border-[#F2ECE1] shrink-0"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Or type voice command here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isThinking}
              className="w-full pl-3.5 pr-12 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] placeholder:text-[#9C8A79] focus:outline-hidden focus:border-[#4A3525]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-[#4A3525] text-white flex items-center justify-center hover:bg-[#382618] disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
