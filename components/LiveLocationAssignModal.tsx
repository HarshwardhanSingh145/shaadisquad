'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWedding } from '@/lib/wedding-context';
import { User, TaskPriority, DEFAULT_TASK_CATEGORIES, TaskCategory } from '@/lib/types';
import { 
  X, 
  MapPin, 
  Compass, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertCircle,
  Radio,
  ChevronRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { playMicChirp, playNotificationChime } from '@/lib/sound';

interface LiveLocationAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedMemberId?: string;
}

// Distance calculation utility
function calculateDistanceMeters(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 150; // default approximate distance
  }
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const QUICK_TASK_PRESETS = [
  'Coordinate Baraat arrival at Gate',
  'Escort Pandit ji to Mandap',
  'Check Stage mic & Sound system',
  'Bring fresh Rose Varmala to stage',
  'Guide VIP family to front row',
  'Replenish Catering dessert counter',
];

export function LiveLocationAssignModal({
  isOpen,
  onClose,
  initialSelectedMemberId,
}: LiveLocationAssignModalProps) {
  const { wedding, teamMembers, currentUser, tasks, createTask } = useWedding();

  const [selectedMember, setSelectedMember] = useState<User | null>(() => {
    if (initialSelectedMemberId) {
      return teamMembers.find((m) => m.id === initialSelectedMemberId) || null;
    }
    return null;
  });

  // Task assignment form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Logistics');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('NORMAL');
  const [taskDueTime, setTaskDueTime] = useState('Next 30 mins');
  const [taskLocation, setTaskLocation] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // Compute live proximity for all members
  const memberLocations = useMemo(() => {
    const baseLat = currentUser?.latitude || 28.5355;
    const baseLon = currentUser?.longitude || 77.3910;

    return teamMembers.map((member, index) => {
      // Realistic venue fallback coordinates if not explicitly set
      const lat = member.latitude ?? (28.5350 + (index * 0.0006));
      const lon = member.longitude ?? (77.3905 + (index * 0.0007));
      const distanceMeters = calculateDistanceMeters(baseLat, baseLon, lat, lon);
      
      let distanceFormatted = `${distanceMeters}m away`;
      let walkTime = `${Math.max(1, Math.round(distanceMeters / 80))} min walk`;
      if (distanceMeters < 30) {
        distanceFormatted = 'Nearby (< 30m)';
        walkTime = '30s walk';
      }

      const memberActiveTasks = tasks.filter(
        (t) => t.assignedUserId === member.id && t.status !== 'COMPLETED'
      );

      return {
        member,
        lat,
        lon,
        distanceMeters,
        distanceFormatted,
        walkTime,
        activeTasksCount: memberActiveTasks.length,
        currentTask: memberActiveTasks[0] || null,
        isSharing: member.locationSharing !== false,
      };
    }).sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [teamMembers, currentUser, tasks]);

  if (!isOpen) return null;

  // When a member is clicked, prefill location and set member
  const handleSelectMember = (member: User) => {
    setSelectedMember(member);
    setTaskLocation(member.currentVenueArea || 'Main Venue');
    setAssignmentSuccess(false);
    playMicChirp();
  };

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !taskTitle.trim()) return;

    createTask({
      title: taskTitle.trim(),
      category: taskCategory,
      assignedUserId: selectedMember.id,
      dueTime: taskDueTime.trim() || 'Next 30 mins',
      location: taskLocation.trim() || selectedMember.currentVenueArea || 'Wedding Venue',
      priority: taskPriority,
      isQuickTask: taskPriority === 'URGENT',
      description: taskDescription.trim() || undefined,
    });

    playNotificationChime(taskPriority === 'URGENT' ? 'urgent' : 'normal');
    setAssignmentSuccess(true);
    setTaskTitle('');
    setTaskDescription('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#4A3525] text-[#FDE68A] flex items-center justify-center shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-[#2B1E16]">
                    Live Location &amp; Assign Work
                  </h2>
                  <span className="text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] px-2 py-0.2 rounded-full flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" /> Live GPS
                  </span>
                </div>
                <p className="text-[11px] text-[#7C6A58]">
                  {wedding?.name || 'Wedding Venue'} · Hand-to-hand task assignment
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* VIEW A: Hand-to-Hand Task Assignment Form for Selected Member */}
          {selectedMember ? (
            <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-3.5">
              {/* Back button & Member Banner */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setAssignmentSuccess(false);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#4A3525] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Live Radar
                </button>

                <span className="text-[10px] font-semibold text-[#8C7A68]">
                  Direct Hand-to-Hand Assignment
                </span>
              </div>

              {/* Selected Member Profile Card */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#DECDB3] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#4A3525] text-white flex items-center justify-center text-sm font-bold shadow-xs relative">
                    {selectedMember.name.charAt(0)}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#16A34A] border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-[#2B1E16]">
                        {selectedMember.name}
                      </h3>
                      <span className="text-[10px] font-bold text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.2 rounded-md">
                        {selectedMember.role}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C4A3A] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                      <strong>{selectedMember.currentVenueArea || 'Main Venue Area'}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-lg block">
                    {selectedMember.availability}
                  </span>
                  <span className="text-[10px] text-[#7C6A58] mt-1 block">
                    {selectedMember.latitude?.toFixed(4)}, {selectedMember.longitude?.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Success Notification Alert */}
              {assignmentSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#15803D]">
                        Work Assigned Hand-to-Hand to {selectedMember.name}!
                      </p>
                      <p className="text-[11px] text-[#166534]">
                        Task notified with priority chime and added to their live dashboard.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssignmentSuccess(false)}
                    className="text-xs font-bold text-[#15803D] underline shrink-0"
                  >
                    Assign Another
                  </button>
                </motion.div>
              )}

              {/* Assignment Form */}
              <form onSubmit={handleAssignTask} className="space-y-3.5">
                {/* 1-Tap Quick Suggestions */}
                <div>
                  <label className="block text-[11px] font-bold text-[#7C6A58] uppercase tracking-wider mb-1.5">
                    1-Tap Task Presets
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TASK_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setTaskTitle(preset);
                          if (preset.includes('Baraat') || preset.includes('luggage')) setTaskCategory('Logistics');
                          else if (preset.includes('Mandap') || preset.includes('Pandit')) setTaskCategory('Ceremony');
                          else if (preset.includes('mic') || preset.includes('Sound')) setTaskCategory('Logistics');
                          else if (preset.includes('Varmala') || preset.includes('Rose')) setTaskCategory('Decoration');
                          else if (preset.includes('Catering') || preset.includes('dessert')) setTaskCategory('Catering');
                          else if (preset.includes('VIP')) setTaskCategory('Hospitality');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#FAF7F2] text-[#4A3B2E] border border-[#DECDB3] hover:bg-[#F3EDE2] transition-colors"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Title */}
                <div>
                  <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                    Task Title / Work Needed *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Check mic at mandap stage or escort guests..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] placeholder:text-[#9C8A79] focus:outline-hidden focus:border-[#4A3525]"
                  />
                </div>

                {/* Workflow Category */}
                <div>
                  <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">
                    Department Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DEFAULT_TASK_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTaskCategory(cat)}
                        className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition-colors truncate ${
                          taskCategory === cat
                            ? 'bg-[#4A3525] text-white border-[#4A3525] shadow-xs'
                            : 'bg-[#FAF7F2] text-[#5C4A3A] border-[#DECDB3] hover:bg-[#F3EDE2]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority & Due Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                      Urgency / Priority
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTaskPriority('NORMAL')}
                        className={`py-2 text-xs font-bold rounded-xl border text-center transition-colors ${
                          taskPriority === 'NORMAL'
                            ? 'bg-[#4A3525] text-white border-[#4A3525]'
                            : 'bg-[#FAF7F2] text-[#7C6A58] border-[#DECDB3]'
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskPriority('URGENT')}
                        className={`py-2 text-xs font-bold rounded-xl border text-center flex items-center justify-center gap-1 transition-colors ${
                          taskPriority === 'URGENT'
                            ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs'
                            : 'bg-[#FFF5F5] text-[#DC2626] border-[#FECACA]'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" /> Urgent
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                      Due Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Next 15 mins, 11:30 AM"
                      value={taskDueTime}
                      onChange={(e) => setTaskDueTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] placeholder:text-[#9C8A79] focus:outline-hidden focus:border-[#4A3525]"
                    />
                  </div>
                </div>

                {/* Venue Location Spot */}
                <div>
                  <label className="block text-xs font-bold text-[#2B1E16] mb-1">
                    Spot / Venue Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Venue spot e.g. Mandap Stage, Main Gate..."
                      value={taskLocation}
                      onChange={(e) => setTaskLocation(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] placeholder:text-[#9C8A79] focus:outline-hidden focus:border-[#4A3525]"
                    />
                    <MapPin className="w-4 h-4 text-[#8C7A68] absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* Submit Hand-to-Hand */}
                <button
                  type="submit"
                  disabled={!taskTitle.trim()}
                  className="w-full py-3 rounded-2xl bg-[#4A3525] hover:bg-[#382618] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Assign Work to {selectedMember.name} Hand-to-Hand
                </button>
              </form>
            </div>
          ) : (
            /* VIEW B: Interactive Live Radar & Member List */
            <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-3.5">
              {/* Radar Visual Canvas */}
              <div className="bg-[#FAF7F2] rounded-3xl p-4 border border-[#DECDB3] shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#2B1E16] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#16A34A]" />
                    Venue Proximity Radar
                  </span>
                  <span className="text-[10px] font-semibold text-[#16A34A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" /> Live Tracking Active
                  </span>
                </div>

                {/* Radar Rings & Plots */}
                <div className="relative w-full aspect-square max-h-56 rounded-2xl bg-[#EFE8DC] border border-[#DECDB3] flex items-center justify-center p-2 overflow-hidden shadow-inner">
                  {/* Concentric rings */}
                  <div className="absolute inset-4 rounded-full border border-[#D8CABE] pointer-events-none" />
                  <div className="absolute inset-16 rounded-full border border-[#DECDB3] pointer-events-none" />
                  <div className="absolute inset-28 rounded-full border border-[#E4D7C8] pointer-events-none" />
                  
                  {/* Center Dot (You) */}
                  <div className="absolute w-3 h-3 rounded-full bg-[#4A3525] ring-4 ring-[#4A3525]/20 pointer-events-none z-0" />

                  {/* Sector Labels */}
                  <span className="absolute top-2 left-3 text-[9px] font-bold text-[#8C7A68] uppercase tracking-wider">
                    Hotel Lobby
                  </span>
                  <span className="absolute top-2 right-3 text-[9px] font-bold text-[#8C7A68] uppercase tracking-wider">
                    Mandap Stage
                  </span>
                  <span className="absolute bottom-2 left-3 text-[9px] font-bold text-[#8C7A68] uppercase tracking-wider">
                    Parking &amp; Gate
                  </span>
                  <span className="absolute bottom-2 right-3 text-[9px] font-bold text-[#8C7A68] uppercase tracking-wider">
                    Banquets / Lawn
                  </span>

                  {/* Member Pins on Radar */}
                  {memberLocations.map(({ member, distanceMeters, distanceFormatted }, idx) => {
                    const angle = (idx * (360 / Math.max(memberLocations.length, 1)) * Math.PI) / 180;
                    const normalizedRadius = Math.min(Math.max((distanceMeters / 600) * 80 + 20, 22), 92);
                    const x = 50 + Math.cos(angle) * normalizedRadius * 0.42;
                    const y = 50 + Math.sin(angle) * normalizedRadius * 0.42;

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleSelectMember(member)}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center z-10 transition-transform active:scale-125 focus:outline-hidden cursor-pointer"
                        title={`Click to assign work to ${member.name}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-md ring-2 ring-white transition-transform group-hover:scale-115 ${
                            member.role === 'ADMIN'
                              ? 'bg-[#92400E]'
                              : member.availability === 'AVAILABLE'
                              ? 'bg-[#16A34A]'
                              : 'bg-[#EA580C]'
                          }`}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <span className="mt-0.5 px-1.5 py-0.2 bg-white/95 rounded-md shadow-xs text-[9px] font-bold text-[#2B1E16] whitespace-nowrap border border-[#DECDB3] group-hover:bg-[#4A3525] group-hover:text-white transition-colors">
                          {member.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-[#7C6A58] mt-2 text-center">
                  💡 <strong>Tip:</strong> Tap any person pin above or click a team card below to assign work hand-to-hand!
                </p>
              </div>

              {/* Members Proximity List */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E8DFC8]">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C6A58]">
                    All Squad Members ({memberLocations.length})
                  </h3>
                  <span className="text-[11px] text-[#8C7A68]">Sorted by Proximity</span>
                </div>

                <div className="space-y-2">
                  {memberLocations.map(({ member, distanceFormatted, walkTime, activeTasksCount, currentTask }) => {
                    const isAvailable = member.availability === 'AVAILABLE';
                    const isMe = member.id === currentUser?.id;

                    return (
                      <div
                        key={member.id}
                        onClick={() => handleSelectMember(member)}
                        className="p-3 rounded-2xl border border-[#EFE7D8] bg-[#FAF7F2] hover:bg-[#F3EDE2] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-2xl bg-[#4A3525] text-white flex items-center justify-center text-sm font-bold shrink-0 relative shadow-2xs group-hover:scale-105 transition-transform">
                            {member.name.charAt(0)}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                isAvailable ? 'bg-[#16A34A]' : 'bg-[#EA580C]'
                              }`}
                            />
                          </div>

                          {/* Member info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#2B1E16] truncate">
                                {member.name} {isMe ? '(You)' : ''}
                              </span>
                              {member.role === 'ADMIN' && (
                                <span className="text-[9px] font-bold text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.2 rounded-md">
                                  Lead
                                </span>
                              )}
                              {member.role === 'COORDINATOR' && (
                                <span className="text-[9px] font-bold text-[#1E40AF] bg-[#DBEAFE] px-1.5 py-0.2 rounded-md">
                                  Coordinator
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-[#5C4A3A] mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-[#16A34A] shrink-0" />
                              <span className="font-semibold truncate">
                                {member.currentVenueArea || 'Main Venue'}
                              </span>
                              <span>·</span>
                              <span className="text-[#8C7A68] shrink-0">{distanceFormatted}</span>
                            </div>

                            {currentTask ? (
                              <p className="text-[10px] text-[#8C7A68] truncate mt-0.5">
                                Current task: {currentTask.title}
                              </p>
                            ) : (
                              <p className="text-[10px] text-[#16A34A] font-semibold mt-0.5">
                                ✓ Ready for new task
                              </p>
                            )}
                          </div>
                        </div>

                        {/* CTA button */}
                        <div className="shrink-0 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectMember(member);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#4A3525] text-white text-xs font-bold hover:bg-[#382618] transition-colors flex items-center gap-1 shadow-2xs group-hover:bg-[#2B1E16]"
                          >
                            Assign <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between text-xs text-[#7C6A58] shrink-0">
            <span>Har kaam, sahi insaan, sahi waqt</span>
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs font-semibold text-[#5C4A3A] hover:bg-[#FAF7F2] rounded-lg"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
