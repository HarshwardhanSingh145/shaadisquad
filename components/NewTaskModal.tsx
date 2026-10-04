'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { X, ClipboardList, MapPin, Clock, User, AlertCircle, Tag } from 'lucide-react';
import { TaskPriority, DEFAULT_TASK_CATEGORIES } from '@/lib/types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialLocation?: string;
}

export function NewTaskModal({ isOpen, onClose, initialTitle, initialLocation }: NewTaskModalProps) {
  const { teamMembers, createTask } = useWedding();
  const [title, setTitle] = useState(initialTitle || '');
  const [category, setCategory] = useState(initialTitle ? 'Logistics' : 'Logistics');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserId, setAssignedUserId] = useState(teamMembers[0]?.id || '');
  const [dueTime, setDueTime] = useState('11:30 AM');
  const [location, setLocation] = useState(initialLocation || 'Wedding Venue');
  const [priority, setPriority] = useState<TaskPriority>('NORMAL');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedUserId) return;

    const finalCategory = category === 'Other' && customCategory.trim()
      ? customCategory.trim()
      : category;

    createTask({
      title: title.trim(),
      category: finalCategory,
      description: description.trim() || undefined,
      assignedUserId,
      dueTime,
      location: location.trim() || 'Wedding Venue',
      priority,
      isQuickTask: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A3525] text-white flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B1E16]">New Task</h2>
              <p className="text-[11px] text-[#7C6A58]">Assign wedding work to team member</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">
              Task Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Pickup Wedding Cards, Stage Sound Check"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-sm text-[#2B1E16] placeholder:text-[#9C8A79] focus:outline-hidden focus:border-[#4A3525] focus:ring-1 focus:ring-[#4A3525]"
            />
          </div>

          {/* Category / Tag Selection */}
          <div>
            <label className="block text-xs font-bold text-[#2B1E16] mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#7C6A58]" />
              Workflow Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {DEFAULT_TASK_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                  }}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all truncate ${
                    category === cat
                      ? 'bg-[#4A3525] text-white border-[#4A3525] shadow-xs'
                      : 'bg-[#FAF7F2] text-[#4A3B2E] border-[#DECDB3] hover:bg-[#F3EDE2]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Person */}
          <div>
            <label className="block text-xs font-bold text-[#2B1E16] mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#7C6A58]" />
              Assign to
            </label>
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-sm text-[#2B1E16] font-medium focus:outline-hidden focus:border-[#4A3525]"
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role === 'ADMIN' ? 'Admin 👑' : member.role === 'COORDINATOR' ? 'Coordinator 📋' : 'Member 🏃'}) — {member.availability}
                </option>
              ))}
            </select>
          </div>

          {/* Time & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2B1E16] mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7C6A58]" />
                Time
              </label>
              <input
                type="text"
                placeholder="e.g. 11:30 AM"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B1E16] mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#7C6A58]" />
                Priority
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setPriority('NORMAL')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    priority === 'NORMAL'
                      ? 'bg-[#4A3525] text-white border-[#4A3525]'
                      : 'bg-[#FAF7F2] text-[#5C4A3A] border-[#DECDB3]'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('URGENT')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    priority === 'URGENT'
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-[#FFF5F5] text-[#991B1B] border-[#FECACA]'
                  }`}
                >
                  Urgent
                </button>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-[#2B1E16] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#7C6A58]" />
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Wedding Venue, Mandap, Hotel Lawn"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
            />
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">
              Specific Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Any details or contact number to call"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full h-12 rounded-xl bg-[#4A3525] hover:bg-[#382618] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#4A3525]/20 active:scale-[0.98] transition-all"
            >
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
