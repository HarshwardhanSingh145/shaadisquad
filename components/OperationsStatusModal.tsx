'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWedding } from '@/lib/wedding-context';
import { Task, TaskStatus } from '@/lib/types';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  Play, 
  Zap, 
  MapPin, 
  UserCheck, 
  AlertCircle,
  RotateCcw,
  Plus
} from 'lucide-react';
import { playNotificationChime } from '@/lib/sound';

export type OperationFilterType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'QUICK';

interface OperationsStatusModalProps {
  isOpen: boolean;
  initialType?: OperationFilterType;
  onClose: () => void;
  onOpenNewTask?: () => void;
  onOpenQuickTask?: () => void;
  onReassignTask?: (task: Task) => void;
}

export function OperationsStatusModal({
  isOpen,
  initialType = 'PENDING',
  onClose,
  onOpenNewTask,
  onOpenQuickTask,
  onReassignTask,
}: OperationsStatusModalProps) {
  const { tasks, updateTaskStatus, currentUser } = useWedding();
  const [selectedTab, setSelectedTab] = useState<OperationFilterType | null>(null);

  if (!isOpen) return null;

  const activeTab = selectedTab ?? initialType;

  // Filter tasks based on activeTab
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const quickTasks = tasks.filter((t) => t.isQuickTask);

  let currentList: Task[] = [];
  if (activeTab === 'PENDING') currentList = pendingTasks;
  else if (activeTab === 'IN_PROGRESS') currentList = inProgressTasks;
  else if (activeTab === 'COMPLETED') currentList = completedTasks;
  else if (activeTab === 'QUICK') currentList = quickTasks;

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    if (newStatus === 'COMPLETED') {
      playNotificationChime('complete');
    } else {
      playNotificationChime('normal');
    }
  };

  const getTabConfig = (tab: OperationFilterType) => {
    switch (tab) {
      case 'PENDING':
        return {
          title: 'Pending Tasks',
          badgeText: `${pendingTasks.length} Awaiting Action`,
          color: 'text-[#92400E]',
          bg: 'bg-[#FAF7F2]',
          border: 'border-[#EFE7D8]',
          indicator: 'bg-[#92400E]',
        };
      case 'IN_PROGRESS':
        return {
          title: 'Tasks In Progress',
          badgeText: `${inProgressTasks.length} Active On Field`,
          color: 'text-[#B45309]',
          bg: 'bg-[#FFFBEB]',
          border: 'border-[#FDE68A]',
          indicator: 'bg-[#F59E0B]',
        };
      case 'COMPLETED':
        return {
          title: 'Completed Operations',
          badgeText: `${completedTasks.length} Accomplished`,
          color: 'text-[#15803D]',
          bg: 'bg-[#F0FDF4]',
          border: 'border-[#BBF7D0]',
          indicator: 'bg-[#16A34A]',
        };
      case 'QUICK':
        return {
          title: 'Quick Operations',
          badgeText: `${quickTasks.length} Urgent Flash Tasks`,
          color: 'text-[#DC2626]',
          bg: 'bg-[#FEF2F2]',
          border: 'border-[#FECACA]',
          indicator: 'bg-[#DC2626]',
        };
    }
  };

  const currentTabConfig = getTabConfig(activeTab);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 max-h-[88vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#2B1E16]">
                  {currentTabConfig.title}
                </h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${currentTabConfig.bg} ${currentTabConfig.color} border ${currentTabConfig.border}`}>
                  {currentList.length}
                </span>
              </div>
              <p className="text-[11px] text-[#7C6A58] mt-0.5">
                Real-time breakdown of current operations & team assignments
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Segmented Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F5EFE6] rounded-2xl my-3 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedTab('PENDING')}
              className={`py-2 px-1 text-center rounded-xl transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-white shadow-xs text-[#2B1E16] font-bold'
                  : 'text-[#7C6A58] hover:text-[#2B1E16] font-medium'
              }`}
            >
              <span className="block text-sm font-extrabold leading-none mb-1">
                {pendingTasks.length}
              </span>
              <span className="block text-[10px] truncate">Pending</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('IN_PROGRESS')}
              className={`py-2 px-1 text-center rounded-xl transition-all ${
                activeTab === 'IN_PROGRESS'
                  ? 'bg-white shadow-xs text-[#B45309] font-bold'
                  : 'text-[#7C6A58] hover:text-[#B45309] font-medium'
              }`}
            >
              <span className="block text-sm font-extrabold leading-none mb-1">
                {inProgressTasks.length}
              </span>
              <span className="block text-[10px] truncate">Progress</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('COMPLETED')}
              className={`py-2 px-1 text-center rounded-xl transition-all ${
                activeTab === 'COMPLETED'
                  ? 'bg-white shadow-xs text-[#15803D] font-bold'
                  : 'text-[#7C6A58] hover:text-[#15803D] font-medium'
              }`}
            >
              <span className="block text-sm font-extrabold leading-none mb-1">
                {completedTasks.length}
              </span>
              <span className="block text-[10px] truncate">Done</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('QUICK')}
              className={`py-2 px-1 text-center rounded-xl transition-all ${
                activeTab === 'QUICK'
                  ? 'bg-white shadow-xs text-[#DC2626] font-bold'
                  : 'text-[#7C6A58] hover:text-[#DC2626] font-medium'
              }`}
            >
              <span className="block text-sm font-extrabold leading-none mb-1">
                {quickTasks.length}
              </span>
              <span className="block text-[10px] truncate">Quick</span>
            </button>
          </div>

          {/* List of Tasks */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[200px]">
            {currentList.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#DECDB3] my-2">
                <div className="w-12 h-12 rounded-2xl bg-white mx-auto flex items-center justify-center text-[#8C7A68] shadow-xs mb-2">
                  <CheckCircle2 className="w-6 h-6 text-[#15803D]" />
                </div>
                <h3 className="text-sm font-bold text-[#2B1E16]">
                  No {currentTabConfig.title} right now
                </h3>
                <p className="text-xs text-[#7C6A58] max-w-xs mx-auto mt-1">
                  Everything in this category is clear or transitioned to the next phase.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  {onOpenQuickTask && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenQuickTask();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C] flex items-center gap-1 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" /> Quick Urgent Task
                    </button>
                  )}
                  {onOpenNewTask && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNewTask();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#4A3525] text-white text-xs font-bold hover:bg-[#382618] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Task
                    </button>
                  )}
                </div>
              </div>
            ) : (
              currentList.map((task) => {
                const isUrgent = task.priority === 'URGENT';
                const isAssignedToMe = task.assignedUserId === currentUser?.id;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      task.status === 'COMPLETED'
                        ? 'bg-[#F9FDF9] border-[#BBF7D0]'
                        : isUrgent
                        ? 'bg-[#FFF8F8] border-[#FECACA]'
                        : 'bg-white border-[#E8DFC8]'
                    }`}
                  >
                    {/* Header line: Title & Tags */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className={`text-sm font-bold ${task.status === 'COMPLETED' ? 'line-through text-[#6B5A4B]' : 'text-[#2B1E16]'}`}>
                            {task.title}
                          </h4>
                          {isUrgent && (
                            <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.2 rounded-md border border-[#FCA5A5]">
                              URGENT
                            </span>
                          )}
                          {task.isQuickTask && (
                            <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.2 rounded-md border border-[#FDE68A] flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5 fill-current" /> QUICK
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-[#7C6A58] mt-0.5 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {task.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A3525] bg-[#F5EFE6] px-2 py-0.5 rounded-md shrink-0">
                          {task.category}
                        </span>
                      )}
                    </div>

                    {/* Meta info: Assignee, Location, Time */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7C6A58] mt-2.5 pt-2 border-t border-[#F2ECE1]">
                      <span className="font-semibold text-[#2B1E16] flex items-center gap-1">
                        👤 {task.assignedUserName} {isAssignedToMe ? '(You)' : ''}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#8C7A68]" />
                        {task.location}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8C7A68]" />
                        {task.dueTime}
                      </span>
                    </div>

                    {/* Operational Action Buttons Hand-to-Hand */}
                    <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#F2ECE1]/80">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8C7A68]">
                        Status: <span className="font-bold text-[#2B1E16]">{task.status}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Reassign option */}
                        {onReassignTask && task.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onReassignTask(task);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF7F2] text-[#4A3525] border border-[#DECDB3] hover:bg-[#F3EDE2] flex items-center gap-1 transition-colors"
                          >
                            <UserCheck className="w-3 h-3" /> Reassign
                          </button>
                        )}

                        {/* Status transition buttons */}
                        {task.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] hover:bg-[#FEF3C7] flex items-center gap-1 transition-colors"
                            >
                              <Play className="w-3 h-3 fill-current" /> Start
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#15803D] text-white hover:bg-[#166534] flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </button>
                          </>
                        )}

                        {task.status === 'IN_PROGRESS' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(task.id, 'PENDING')}
                              className="px-2 py-1 text-xs font-medium text-[#7C6A58] hover:bg-[#FAF7F2] rounded-lg"
                            >
                              Pause
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                              className="px-3 py-1 text-xs font-bold rounded-lg bg-[#15803D] text-white hover:bg-[#166534] flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Complete
                            </button>
                          </>
                        )}

                        {task.status === 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(task.id, 'PENDING')}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF7F2] text-[#7C6A58] border border-[#DECDB3] hover:bg-[#F3EDE2] flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Bottom Bar: Quick Create CTA */}
          <div className="mt-3 pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-xs text-[#7C6A58] shrink-0">
            <span>Tap any action button to update hand-to-hand</span>
            <div className="flex items-center gap-2">
              {onOpenNewTask && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewTask();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#4A3525] text-white font-bold hover:bg-[#382618] transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign New Task
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
