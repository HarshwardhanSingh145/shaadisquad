'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useWedding } from '@/lib/wedding-context';
import { UserRole } from '@/lib/types';
import { 
  HeartHandshake, 
  Sparkles, 
  MapPin, 
  Zap, 
  Radio, 
  ArrowRight, 
  Check, 
  Copy, 
  ShieldCheck, 
  Crown, 
  Users, 
  Calendar,
  KeyRound,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { playNotificationChime } from '@/lib/sound';

interface AuthWelcomeViewProps {
  onEnterApp: () => void;
}

export function AuthWelcomeView({ onEnterApp }: AuthWelcomeViewProps) {
  const { 
    firebaseUser, 
    signInWithGoogle, 
    signOutUser,
    createWedding, 
    joinWedding,
    startSession,
    currentUser,
    wedding,
    resetToSampleData,
  } = useWedding();

  const [step, setStep] = useState<'WELCOME' | 'CHOOSE_GROUP' | 'CREATE_GROUP' | 'JOIN_GROUP' | 'CODE_SUCCESS'>(
    firebaseUser ? 'CHOOSE_GROUP' : 'WELCOME'
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Create Wedding form state
  const [weddingName, setWeddingName] = useState('Sharma Wedding');
  const [coupleName, setCoupleName] = useState('Pooja & Rahul');
  const [weddingDate, setWeddingDate] = useState('2026-10-04');
  const [adminName, setAdminName] = useState(firebaseUser?.displayName || currentUser?.name || 'Aman');

  // Join Wedding form state
  const [joinCode, setJoinCode] = useState('');
  const [joinUserName, setJoinUserName] = useState(firebaseUser?.displayName || currentUser?.name || '');
  const [joinRole, setJoinRole] = useState<UserRole>('MEMBER');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Generated code on creation
  const [createdCode, setCreatedCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      await signInWithGoogle();
      setIsSigningIn(false);
      setStep('CHOOSE_GROUP');
    } catch (err: unknown) {
      console.warn('Google Sign-In fallback:', err);
      setIsSigningIn(false);
      // Even if popup has an issue in preview iframe, gracefully allow continuing
      setSignInError('Google popup interrupted. You can continue via Demo/Guest sign-in below.');
    }
  };

  // Guest / Demo instant login
  const handleGuestDemoLogin = () => {
    resetToSampleData();
    onEnterApp();
  };

  // Handle Create Wedding
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingName.trim()) return;

    const newWed = createWedding({
      name: weddingName.trim(),
      coupleName: coupleName.trim() || 'Bride & Groom',
      date: weddingDate,
      adminName: adminName.trim() || firebaseUser?.displayName || 'Lead Admin',
    });

    setCreatedCode(newWed.weddingCode);
    setStep('CODE_SUCCESS');
  };

  // Handle Join Wedding
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setJoinError('Please enter a 6-digit wedding code');
      return;
    }

    const name = joinUserName.trim() || firebaseUser?.displayName || 'Team Member';
    const result = joinWedding(joinCode.trim(), name, joinRole);

    if (result.success) {
      playNotificationChime('complete');
      startSession();
      onEnterApp();
    } else {
      setJoinError(result.message);
    }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1E1B18] flex flex-col justify-between selection:bg-[#E8DCC8] relative overflow-hidden">
      {/* Background festive ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-[#F5E6CC]/60 via-[#FAF0E1]/40 to-transparent pointer-events-none -z-0" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-5 py-6 flex flex-col justify-center relative z-10">
        
        {/* STEP 1: WELCOME & GOOGLE SIGN IN SCREEN */}
        {step === 'WELCOME' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Animated Festive Hero Header */}
            <div className="text-center pt-2">
              {/* Rotating Mandap Ring & Icon */}
              <div className="relative inline-flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-20 h-20 rounded-full border-2 border-dashed border-[#D97706]/40"
                />
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-3xl bg-[#4A3525] text-[#FDE68A] flex items-center justify-center shadow-xl shadow-[#4A3525]/20 ring-4 ring-[#FAF0E1]"
                >
                  <HeartHandshake className="w-8 h-8 stroke-[1.8]" />
                </motion.div>
              </div>

              {/* Badges */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] font-bold shadow-2xs mb-2">
                <Sparkles className="w-3 h-3 text-[#D97706]" />
                India&apos;s #1 Wedding Operations App
              </div>

              {/* App Title in English & Hindi */}
              <h1 className="text-3xl font-extrabold tracking-tight text-[#2B1E16]">
                Shaadi Squad
              </h1>
              <p className="text-base font-bold text-[#B45309] mt-0.5 font-serif">
                शादी स्क्वॉड
              </p>
              <p className="text-xs font-semibold text-[#7C6A58] mt-1.5 max-w-xs mx-auto">
                &ldquo;हर काम, सही इंसान, सही वक़्त&rdquo;
              </p>
              <p className="text-[11px] text-[#8C7A68] mt-0.5">
                Real-time wedding team coordination &amp; work assignment
              </p>
            </div>

            {/* Feature Cards Carousel / Highlights */}
            <div className="space-y-2 py-1">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 rounded-2xl bg-white border border-[#E8DFC8] flex items-center gap-3 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#2B1E16]">Live Location Radar</h4>
                  <p className="text-[10px] text-[#7C6A58] truncate">
                    Know exact positions of decorators, catering &amp; coordinators.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 }}
                className="p-3 rounded-2xl bg-white border border-[#E8DFC8] flex items-center gap-3 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#2B1E16]">15-Second Task Assignment</h4>
                  <p className="text-[10px] text-[#7C6A58] truncate">
                    Assign emerging tasks hand-to-hand without walkie-talkie chaos.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="p-3 rounded-2xl bg-white border border-[#E8DFC8] flex items-center gap-3 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-[#4A3525] flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4 text-[#D97706]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#2B1E16]">Squad Radio &amp; Voice Notes</h4>
                  <p className="text-[10px] text-[#7C6A58] truncate">
                    Walkie-talkie audio notes and real-time operational broadcasts.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Sign-In Actions Section */}
            <div className="space-y-3 pt-2">
              {signInError && (
                <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[11px] text-[#B91C1C]">
                  {signInError}
                </div>
              )}

              {/* Official Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#2B1E16] font-bold text-xs border border-[#DECDB3] shadow-md hover:shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer"
              >
                {/* Official Google G Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

                <span>
                  {isSigningIn ? 'Signing in with Google...' : 'Continue with Google (गूगल से साइन इन करें)'}
                </span>
              </button>

              {/* Instant Guest / Demo Login */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleGuestDemoLogin}
                  className="text-xs font-semibold text-[#7C6A58] hover:text-[#4A3525] underline decoration-[#DECDB3] transition-colors"
                >
                  या डेमो स्क्वॉड से तुरंत शुरू करें (Instant Demo Lead) &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: CHOOSE ACTION - CREATE WEDDING OR JOIN WEDDING */}
        {step === 'CHOOSE_GROUP' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* User Greeting Bar */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC8] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {firebaseUser?.photoURL ? (
                  <Image
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    width={36}
                    height={36}
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full border border-[#DECDB3] shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#4A3525] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {firebaseUser?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#2B1E16] block truncate">
                    Namaste, {firebaseUser?.displayName || 'Squad Member'} 👋
                  </span>
                  <span className="text-[10px] text-[#7C6A58] block truncate">
                    {firebaseUser?.email || 'Authenticated User'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await signOutUser();
                  setStep('WELCOME');
                }}
                className="text-[11px] font-semibold text-[#7C6A58] hover:text-[#B91C1C] flex items-center gap-1 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>

            <div className="text-center py-1">
              <h2 className="text-xl font-bold text-[#2B1E16]">
                Choose Wedding Setup
              </h2>
              <p className="text-xs text-[#7C6A58] mt-0.5">
                Are you leading a wedding or joining an existing squad?
              </p>
            </div>

            {/* Two Large Choices */}
            <div className="space-y-3">
              {/* Option 1: Create Wedding Group (Admin) */}
              <button
                type="button"
                onClick={() => setStep('CREATE_GROUP')}
                className="w-full p-5 rounded-3xl bg-white border-2 border-[#DECDB3] hover:border-[#4A3525] hover:shadow-md text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center font-bold">
                        <Crown className="w-4 h-4" />
                      </div>
                      <span className="text-base font-bold text-[#2B1E16]">
                        Create Wedding Group
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#4A3525] group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </div>
                  <p className="text-xs text-[#7C6A58] mt-2 leading-relaxed">
                    <strong>For Wedding Leads, Bride &amp; Groom:</strong> Create a new group, get a unique 6-digit code, and assign work to coordinators &amp; helpers.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#15803D]">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Full Admin Lead Permissions
                </div>
              </button>

              {/* Option 2: Join with Code (Coordinator / Helper) */}
              <button
                type="button"
                onClick={() => setStep('JOIN_GROUP')}
                className="w-full p-5 rounded-3xl bg-white border-2 border-[#DECDB3] hover:border-[#1E40AF] hover:shadow-md text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] text-[#1E40AF] flex items-center justify-center font-bold">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <span className="text-base font-bold text-[#2B1E16]">
                        Join with 6-Digit Code
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#1E40AF] group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </div>
                  <p className="text-xs text-[#7C6A58] mt-2 leading-relaxed">
                    <strong>For Family Members, Friends &amp; Vendors:</strong> Enter the 6-digit code shared by the wedding lead to see your tasks &amp; radar location.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#1E40AF]">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Instant Team Sync
                </div>
              </button>

              {/* Sample Wedding Shortcut */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleGuestDemoLogin}
                  className="text-xs font-semibold text-[#7C6A58] hover:text-[#4A3525] underline transition-colors"
                >
                  Or enter current sample wedding (Sharma Wedding) &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: CREATE WEDDING GROUP FORM */}
        {step === 'CREATE_GROUP' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('CHOOSE_GROUP')}
                className="text-xs font-bold text-[#4A3525] hover:underline flex items-center gap-1"
              >
                &larr; Back
              </button>
              <span className="text-xs font-bold text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                👑 Admin Setup
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#2B1E16]">
                Create Wedding Group
              </h2>
              <p className="text-xs text-[#7C6A58]">
                Setup your wedding event and receive your 6-digit invite code.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 bg-white p-4 rounded-3xl border border-[#E8DFC8] shadow-xs">
              <div>
                <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                  Wedding Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Wedding, Kapoor Celebration"
                  value={weddingName}
                  onChange={(e) => setWeddingName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                  Couple&apos;s Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja &amp; Rahul"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                    Your Lead Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#4A3525] hover:bg-[#382618] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] mt-2 cursor-pointer"
              >
                <span>Create Wedding &amp; Generate Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 4: CODE SUCCESS SCREEN */}
        {step === 'CODE_SUCCESS' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-white p-5 rounded-3xl border border-[#E8DFC8] shadow-md text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#15803D] mx-auto flex items-center justify-center">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>

              <h2 className="text-lg font-bold text-[#2B1E16]">
                {weddingName} Created!
              </h2>
              <p className="text-xs text-[#7C6A58]">
                Share this 6-digit code with your family, friends &amp; wedding coordinators to join:
              </p>

              {/* Big 6-Digit Code Box */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border-2 border-dashed border-[#D97706]/50 flex items-center justify-center gap-3">
                <span className="text-2xl font-extrabold tracking-widest text-[#4A3525] font-mono">
                  {createdCode}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="px-3 py-1.5 rounded-xl bg-[#4A3525] text-white text-xs font-bold hover:bg-[#382618] flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  startSession();
                  onEnterApp();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>Enter Squad Dashboard Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: JOIN WEDDING GROUP FORM */}
        {step === 'JOIN_GROUP' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('CHOOSE_GROUP')}
                className="text-xs font-bold text-[#4A3525] hover:underline flex items-center gap-1"
              >
                &larr; Back
              </button>
              <span className="text-xs font-bold text-[#1E40AF] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                🔑 Join Squad
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#2B1E16]">
                Join Wedding Squad
              </h2>
              <p className="text-xs text-[#7C6A58]">
                Enter the 6-digit wedding code provided by the wedding lead.
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-3.5 bg-white p-4 rounded-3xl border border-[#E8DFC8] shadow-xs">
              {joinError && (
                <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[11px] text-[#B91C1C]">
                  {joinError}
                </div>
              )}

              {/* 6-Digit Code */}
              <div>
                <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                  6-Digit Wedding Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 482731"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value);
                    setJoinError(null);
                  }}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-center text-lg font-extrabold tracking-widest text-[#2B1E16] font-mono focus:outline-hidden focus:border-[#4A3525]"
                />
                <p className="text-[10px] text-[#8C7A68] mt-1 text-center">
                  💡 Tip: The demo code for Sharma Wedding is <strong>482731</strong>
                </p>
              </div>

              {/* Your Name */}
              <div>
                <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={joinUserName}
                  onChange={(e) => setJoinUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
                />
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">
                  Joining As:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJoinRole('COORDINATOR')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      joinRole === 'COORDINATOR'
                        ? 'bg-[#DBEAFE] border-[#3B82F6] text-[#1E40AF]'
                        : 'bg-[#FAF7F2] border-[#DECDB3] text-[#5C4A3A]'
                    }`}
                  >
                    <span className="block text-xs font-bold">Coordinator</span>
                    <span className="block text-[10px] opacity-80">Can assign &amp; lead</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setJoinRole('MEMBER')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      joinRole === 'MEMBER'
                        ? 'bg-[#DCFCE7] border-[#22C55E] text-[#15803D]'
                        : 'bg-[#FAF7F2] border-[#DECDB3] text-[#5C4A3A]'
                    }`}
                  >
                    <span className="block text-xs font-bold">Team Member</span>
                    <span className="block text-[10px] opacity-80">Family / Helper</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#4A3525] hover:bg-[#382618] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>Join Wedding Squad</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-md mx-auto px-4 py-3 text-center text-[11px] text-[#8C7A68] border-t border-[#E8DFC8]/60 relative z-10">
        Shaadi Squad · Real-time Wedding Team Management
      </footer>
    </div>
  );
}
