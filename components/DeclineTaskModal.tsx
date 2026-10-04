'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { X, AlertCircle } from 'lucide-react';
import { Task } from '@/lib/types';

interface DeclineTaskModalProps {
  task: Task | null;
  onClose: () => void;
}

const REASONS = [
  'Busy with another work',
  'Too far from location',
  'Need help / Extra hands',
  'Other urgency',
];

export function DeclineTaskModal({ task, onClose }: DeclineTaskModalProps) {
  const { declineTask } = useWedding();
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customNote, setCustomNote] = useState('');

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other urgency' && customNote.trim()
      ? customNote.trim()
      : selectedReason;

    declineTask(task.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B1E16]">Can&apos;t Do Task</h3>
              <p className="text-[11px] text-[#7C6A58]">Notify Admin to reassign immediately</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#4A3B2E] mb-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#DECDB3]">
          Task: <strong className="text-[#2B1E16]">{task.title}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-bold text-[#2B1E16]">
            Select reason:
          </label>

          <div className="space-y-2">
            {REASONS.map((reason) => (
              <button
                type="button"
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                  selectedReason === reason
                    ? 'bg-[#4A3525] text-white border-[#4A3525]'
                    : 'bg-[#FAF7F2] text-[#3D2B1E] border-[#DECDB3] hover:bg-[#F3EDE2]'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          {selectedReason === 'Other urgency' && (
            <div>
              <input
                type="text"
                placeholder="Brief reason..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-[#2B1E16] focus:outline-hidden focus:border-[#4A3525]"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-md transition-all"
            >
              Send Notice to Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
