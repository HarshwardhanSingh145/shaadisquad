'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { UserRole } from '@/lib/types';
import { Sparkles, Users, ArrowRight, Copy, Check, ShieldCheck, HeartHandshake } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: () => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const { createWedding, joinWedding } = useWedding();
  const [mode, setMode] = useState<'CHOICE' | 'CREATE' | 'JOIN' | 'CODE_SHARED'>('CHOICE');
  
  // Create form state
  const [weddingName, setWeddingName] = useState('Sharma Wedding');
  const [coupleName, setCoupleName] = useState('Pooja & Rahul');
  const [weddingDate, setWeddingDate] = useState('2026-10-04');
  const [adminName, setAdminName] = useState('Aman');

  // Join form state
  const [joinCode, setJoinCode] = useState('');
  const [joinUserName, setJoinUserName] = useState('');
  const [joinRole, setJoinRole] = useState<UserRole>('MEMBER');
  const [joinStatusMsg, setJoinStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Created code display
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingName.trim() || !adminName.trim()) return;

    const newWed = createWedding({
      name: weddingName,
      coupleName,
      date: weddingDate,
      adminName,
    });

    setGeneratedCode(newWed.weddingCode);
    setMode('CODE_SHARED');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !joinUserName.trim()) return;

    const result = joinWedding(joinCode, joinUserName, joinRole);
    if (result.success) {
      setJoinStatusMsg({ type: 'success', text: result.message });
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      setJoinStatusMsg({ type: 'error', text: result.message });
    }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4A3525] text-white shadow-lg mb-3">
          <HeartHandshake className="w-8 h-8 stroke-[1.75]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2B1E16]">Shaadi Squad</h1>
        <p className="text-xs font-medium text-[#7C6A58] mt-1">
          “Har kaam, sahi insaan, sahi waqt.”
        </p>
      </div>

      {/* Choice Screen: Two Large Choices */}
      {mode === 'CHOICE' && (
        <div className="space-y-4">
          <button
            onClick={() => setMode('CREATE')}
            className="w-full p-6 rounded-3xl bg-white border border-[#E8DFC8] shadow-sm hover:shadow-md hover:border-[#4A3525] text-left transition-all group min-h-[120px] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#2B1E16]">Create Wedding</span>
                <span className="text-base group-hover:translate-x-1 transition-transform text-[#4A3525]">
                  &rarr;
                </span>
              </div>
              <p className="text-xs text-[#7C6A58] mt-1.5 leading-relaxed">
                For the bride, groom, or wedding lead. Sets up the group, assigns tasks, and gets a 6-digit code.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#4A3525]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              Team Lead / Admin Access
            </div>
          </button>

          <button
            onClick={() => setMode('JOIN')}
            className="w-full p-6 rounded-3xl bg-[#FAF7F2] border border-[#DECDB3] shadow-xs hover:shadow-md hover:border-[#4A3525] text-left transition-all group min-h-[120px] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#2B1E16]">Join Wedding</span>
                <span className="text-base group-hover:translate-x-1 transition-transform text-[#4A3525]">
                  &rarr;
                </span>
              </div>
              <p className="text-xs text-[#7C6A58] mt-1.5 leading-relaxed">
                Have a 6-digit wedding code? Enter it to join the squad and see your assigned responsibilities.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#7C6A58]">
              <Users className="w-3.5 h-3.5" />
              Coordinator or Team Member
            </div>
          </button>
        </div>
      )}

      {/* Create Wedding Form */}
      {mode === 'CREATE' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DFC8]">
          <div className="flex items-center justify-between mb-4 border-b border-[#F2ECE1] pb-3">
            <h2 className="text-base font-bold text-[#2B1E16]">Create Wedding</h2>
            <button
              onClick={() => setMode('CHOICE')}
              className="text-xs font-semibold text-[#7C6A58] hover:text-[#2B1E16]"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                Wedding Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sharma Wedding"
                value={weddingName}
                onChange={(e) => setWeddingName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-sm text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                Bride & Groom Names
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pooja & Rahul"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-sm text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                  Wedding Date
                </label>
                <input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                  Your Name (Admin)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aman"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#4A3525] hover:bg-[#382618] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                Create Wedding Group
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Code Generated Screen */}
      {mode === 'CODE_SHARED' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DFC8] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#2B1E16]">Wedding Group Created!</h2>
            <p className="text-xs text-[#7C6A58] mt-1">
              Share this code with your wedding team:
            </p>
          </div>

          {/* 6-Digit Code Display */}
          <div className="py-4 px-6 rounded-2xl bg-[#FAF7F2] border-2 border-dashed border-[#DECDB3] flex items-center justify-between">
            <span className="text-2xl font-mono font-bold tracking-widest text-[#2B1E16]">
              {generatedCode}
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A3525] text-white text-xs font-semibold hover:bg-[#382618] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="text-[11px] text-[#7C6A58]">
            Team members will enter this code to send a join request. You can approve or reject members in 1 tap.
          </p>

          <button
            onClick={onComplete}
            className="w-full h-12 rounded-xl bg-[#4A3525] hover:bg-[#382618] text-white font-bold text-sm shadow-md transition-all"
          >
            Enter Wedding App
          </button>
        </div>
      )}

      {/* Join Wedding Form */}
      {mode === 'JOIN' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DFC8]">
          <div className="flex items-center justify-between mb-4 border-b border-[#F2ECE1] pb-3">
            <h2 className="text-base font-bold text-[#2B1E16]">Join Wedding</h2>
            <button
              onClick={() => setMode('CHOICE')}
              className="text-xs font-semibold text-[#7C6A58] hover:text-[#2B1E16]"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                6-Digit Wedding Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. 482731"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-3 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-lg font-mono font-bold tracking-widest text-[#2B1E16] text-center focus:outline-hidden focus:border-[#4A3525]"
              />
              <p className="text-[10px] text-[#7C6A58] mt-1 text-center">
                Tip: Demo code is <strong>482731</strong> (Sharma Wedding)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul, Vikas, Pooja"
                value={joinUserName}
                onChange={(e) => setJoinUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-sm text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                Role Requested
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJoinRole('MEMBER')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    joinRole === 'MEMBER'
                      ? 'bg-[#4A3525] text-white border-[#4A3525]'
                      : 'bg-[#FAF7F2] text-[#5C4A3A] border-[#DECDB3]'
                  }`}
                >
                  🏃 Team Member
                </button>
                <button
                  type="button"
                  onClick={() => setJoinRole('COORDINATOR')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    joinRole === 'COORDINATOR'
                      ? 'bg-[#4A3525] text-white border-[#4A3525]'
                      : 'bg-[#FAF7F2] text-[#5C4A3A] border-[#DECDB3]'
                  }`}
                >
                  📋 Coordinator
                </button>
              </div>
            </div>

            {joinStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  joinStatusMsg.type === 'success'
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'bg-[#FEE2E2] text-[#DC2626]'
                }`}
              >
                {joinStatusMsg.text}
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={joinCode.length !== 6 || !joinUserName.trim()}
                className="w-full h-12 rounded-xl bg-[#4A3525] hover:bg-[#382618] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                Send Join Request
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
