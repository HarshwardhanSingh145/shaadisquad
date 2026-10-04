'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useWedding } from '@/lib/wedding-context';
import { 
  User, 
  MapPin, 
  Copy, 
  Check, 
  LogOut, 
  RefreshCw, 
  ShieldCheck, 
  Bell, 
  Users,
  Compass,
  Crown
} from 'lucide-react';

export function ProfileView() {
  const { 
    currentUser, 
    wedding, 
    toggleLocationSharing, 
    teamMembers, 
    switchUser, 
    leaveWedding, 
    resetToSampleData,
    firebaseUser,
    signInWithGoogle,
    signOutUser,
  } = useWedding();
  const [copied, setCopied] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  if (!currentUser || !wedding) return null;

  const copyCode = () => {
    navigator.clipboard?.writeText(wedding.weddingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-bold text-[#2B1E16] tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-xs text-[#7C6A58]">
          Har kaam, sahi insaan, sahi waqt.
        </p>
      </div>

      {/* Firebase Cloud & Auth Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8DFC8] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center font-bold">
              🔥
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#2B1E16]">
                Firebase Cloud & Auth
              </h3>
              <p className="text-[10px] text-[#7C6A58]">
                Google Sign-in & Firestore Database
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            Connected
          </span>
        </div>

        {firebaseUser ? (
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#DECDB3] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {firebaseUser.photoURL ? (
                <Image
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'Google User'}
                  width={36}
                  height={36}
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full border border-[#DECDB3] shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#4A3525] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {firebaseUser.displayName?.charAt(0) || 'G'}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#2B1E16] block truncate">
                  {firebaseUser.displayName || 'Google Authenticated'}
                </span>
                <span className="text-[11px] text-[#7C6A58] block truncate">
                  {firebaseUser.email}
                </span>
              </div>
            </div>

            <button
              onClick={signOutUser}
              className="px-3 py-1.5 rounded-xl border border-[#DECDB3] bg-white text-[#7C6A58] text-xs font-semibold hover:bg-[#F3EDE2] transition-colors shrink-0"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-[#5C4A3A]">
              Sign in with your Google account to secure your squad identity and sync tasks across all devices in real-time.
            </p>
            <button
              onClick={signInWithGoogle}
              className="w-full h-11 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#2B1E16] text-xs font-bold border border-[#DECDB3] shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign In with Google Account
            </button>
          </div>
        )}
      </div>

      {/* User Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8DFC8] shadow-xs">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4A3525] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-[#2B1E16]">
                {currentUser.name}
              </h2>
              {currentUser.role === 'ADMIN' && (
                <span className="text-[10px] font-bold text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Crown className="w-3 h-3 text-[#D97706]" /> Admin
                </span>
              )}
              {currentUser.role === 'COORDINATOR' && (
                <span className="text-[10px] font-bold text-[#1E40AF] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                  Coordinator
                </span>
              )}
              {currentUser.role === 'MEMBER' && (
                <span className="text-[10px] font-semibold text-[#5C4A3A] bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                  Team Member
                </span>
              )}
            </div>
            <p className="text-xs text-[#7C6A58] mt-0.5">
              {wedding.name} · Day {wedding.dayNumber}
            </p>
          </div>
        </div>

        {/* Wedding Group Code */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#DECDB3] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C6A58]">
              Wedding Team Code
            </span>
            <span className="block text-lg font-mono font-bold text-[#2B1E16] tracking-wider mt-0.5">
              {wedding.weddingCode}
            </span>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4A3525] text-white text-xs font-semibold hover:bg-[#382618] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Share Code'}
          </button>
        </div>
      </div>

      {/* Location Privacy Setting */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8DFC8] shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#2B1E16]">
                Share my location during this wedding
              </h3>
              <p className="text-[11px] text-[#7C6A58] mt-0.5 leading-relaxed">
                Allows Admin & Coordinator to find the closest team member for urgent Quick Tasks.
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={currentUser.locationSharing}
            onClick={() => toggleLocationSharing(!currentUser.locationSharing)}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 focus:outline-hidden ${
              currentUser.locationSharing ? 'bg-[#15803D]' : 'bg-[#D1D5DB]'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                currentUser.locationSharing ? 'translate-x-6.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="pt-2 border-t border-[#F2ECE1] text-[10px] text-[#7C6A58] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
          <span>
            Privacy protected: No location history is recorded. Sharing stops automatically when group concludes.
          </span>
        </div>
      </div>

      {/* Notifications Setting */}
      <div className="bg-white rounded-3xl p-4 border border-[#E8DFC8] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#2B1E16]">Urgent Task Alerts</h3>
            <p className="text-[11px] text-[#7C6A58]">Instant audio chime & banner for quick tasks</p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={notificationsEnabled}
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-hidden ${
            notificationsEnabled ? 'bg-[#4A3525]' : 'bg-[#D1D5DB]'
          }`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
              notificationsEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Fast Role / Persona Switcher (For Evaluation Testing) */}
      <div className="bg-white rounded-3xl p-4 border border-[#E8DFC8] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#2B1E16] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#4A3525]" />
            Test Different Roles
          </h3>
          <span className="text-[10px] font-semibold text-[#7C6A58]">
            Instant switch
          </span>
        </div>
        <p className="text-[11px] text-[#7C6A58] mb-3">
          Switch user to test how Admin assigns, Member accepts, and Coordinator reassigns:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {teamMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => switchUser(member.id)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                currentUser.id === member.id
                  ? 'bg-[#4A3525] text-white border-[#4A3525] font-bold shadow-xs'
                  : 'bg-[#FAF7F2] text-[#2B1E16] border-[#DECDB3] hover:bg-[#F3EDE2]'
              }`}
            >
              <span className="block truncate font-bold">{member.name}</span>
              <span className={`text-[10px] block ${currentUser.id === member.id ? 'text-white/80' : 'text-[#7C6A58]'}`}>
                {member.role === 'ADMIN' ? '👑 Admin' : member.role === 'COORDINATOR' ? '📋 Coordinator' : '🏃 Team Member'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Controls: Reset Demo Data & Leave */}
      <div className="space-y-2 pt-1">
        <button
          onClick={resetToSampleData}
          className="w-full py-3 px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#DECDB3] text-xs font-bold text-[#4A3525] flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demo Data to Sharma Wedding
        </button>

        {showLeaveConfirm ? (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] space-y-2.5 animate-in fade-in">
            <div>
              <p className="text-xs font-bold text-[#B91C1C]">
                Leave this Wedding Squad?
              </p>
              <p className="text-[11px] text-[#7F1D1D] mt-0.5">
                You will be removed from this wedding group and returned to the start screen.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  leaveWedding();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Yes, Leave Wedding
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-white border border-[#FECACA] text-xs font-semibold text-[#7C6A58] hover:bg-[#FAF7F2] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="w-full py-3 px-4 rounded-2xl bg-[#FFF5F5] hover:bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#DC2626] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Leave Wedding
          </button>
        )}
      </div>
    </div>
  );
}
