'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { Task, TaskStatus, DEFAULT_TASK_CATEGORIES } from '@/lib/types';
import { 
  Zap, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Plus, 
  Filter,
  User as UserIcon,
  HelpCircle,
  Tag,
  Navigation
} from 'lucide-react';

interface TasksViewProps {
  onOpenNewTask: () => void;
  onOpenQuickTask: () => void;
  onReassignTask: (task: Task) => void;
  onDeclineTask: (task: Task) => void;
  onOpenMapsScout?: () => void;
}

type FilterType = 'all' | 'mine' | 'urgent' | 'completed';

export function TasksView({
  onOpenNewTask,
  onOpenQuickTask,
  onReassignTask,
  onDeclineTask,
  onOpenMapsScout,
}: TasksViewProps) {
  const { tasks, currentUser, updateTaskStatus, requestTaskHelp, teamMembers } = useWedding();
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const isAdmin = currentUser?.role === 'ADMIN';
  const isCoordinator = currentUser?.role === 'COORDINATOR';

  // Filter tasks by status tab and category
  const filteredTasks = tasks.filter((task) => {
    // Status tab filter
    if (filter === 'mine' && task.assignedUserId !== currentUser?.id) return false;
    if (filter === 'urgent' && !task.isQuickTask && task.priority !== 'URGENT') return false;
    if (filter === 'completed' && task.status !== 'COMPLETED') return false;

    // Category filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    return true;
  });

  return (
    <div className="space-y-3.5 pb-24">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-[#2B1E16] tracking-tight">
            Wedding Tasks
          </h1>
          <p className="text-xs text-[#7C6A58]">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} showing
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenMapsScout && (
            <button
              onClick={onOpenMapsScout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors"
              title="Find emergency vendors & stores with Google Maps"
            >
              <Navigation className="w-3.5 h-3.5" />
              Scout
            </button>
          )}

          <button
            onClick={onOpenQuickTask}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Quick Task
          </button>
        </div>
      </div>

      {/* Segmented Status Filter Bar */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-[#E8DFC8] overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'mine', label: 'My Work' },
          { id: 'urgent', label: 'Urgent' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as FilterType)}
            className={`flex-1 min-w-[75px] py-1.5 px-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap text-center ${
              filter === tab.id
                ? 'bg-[#4A3525] text-white shadow-xs'
                : 'text-[#7C6A58] hover:text-[#2B1E16] hover:bg-[#FAF7F2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all shrink-0 border ${
            categoryFilter === 'all'
              ? 'bg-[#4A3525] text-white border-[#4A3525]'
              : 'bg-white text-[#7C6A58] border-[#E8DFC8] hover:bg-[#FAF7F2]'
          }`}
        >
          All Categories
        </button>
        {DEFAULT_TASK_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all shrink-0 border ${
              categoryFilter === cat
                ? 'bg-[#4A3525] text-white border-[#4A3525]'
                : 'bg-white text-[#5C4A3A] border-[#E8DFC8] hover:bg-[#FAF7F2]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-[#E8DFC8] text-center my-6">
          <CheckCircle2 className="w-8 h-8 text-[#7C6A58] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold text-[#2B1E16]">No tasks match this filter</p>
          <p className="text-[11px] text-[#7C6A58] mt-0.5">
            Switch filters or create a new task.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isAssignedToMe = task.assignedUserId === currentUser?.id;
            const isUrgent = task.priority === 'URGENT';
            const isCompleted = task.status === 'COMPLETED';
            const isInProgress = task.status === 'IN_PROGRESS';
            const isPending = task.status === 'PENDING';

            const assignedMember = teamMembers.find((m) => m.id === task.assignedUserId);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-[#F9FAF8] border-[#DCFCE7] opacity-80'
                    : isUrgent
                    ? 'bg-[#FFF8F8] border-[#FECACA] shadow-xs'
                    : 'bg-white border-[#E8DFC8] shadow-xs'
                }`}
              >
                {/* Header Row: Title, Category Badge & Priority / Quick Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${
                        isCompleted
                          ? 'bg-[#15803D]'
                          : isInProgress
                          ? 'bg-[#F59E0B]'
                          : isUrgent
                          ? 'bg-[#DC2626] animate-pulse'
                          : 'bg-[#EA580C]'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-[#2B1E16] leading-snug">
                          {task.title}
                        </h3>
                        {task.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A3525] bg-[#F5EFE6] px-2 py-0.5 rounded-md shrink-0">
                            {task.category}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-[#5C4A3A] mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {task.isQuickTask && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Zap className="w-3 h-3 fill-current" /> Quick
                      </span>
                    )}
                    {!task.isQuickTask && isUrgent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata Row: Person, Time, Location */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#7C6A58] my-3 pl-5.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <UserIcon className="w-3.5 h-3.5 text-[#8C7A68] shrink-0" />
                    <span className="font-semibold text-[#2B1E16] truncate">
                      {isAssignedToMe ? 'Assigned to You' : task.assignedUserName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-[#8C7A68] shrink-0" />
                    <span className="text-[#3D2B1E] font-medium">{task.dueTime}</span>
                  </div>

                  <div className="flex items-center gap-1.5 col-span-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#8C7A68] shrink-0" />
                    <span className="text-[#4A3B2E] truncate">{task.location}</span>
                  </div>
                </div>

                {/* Help Requested Alert Tag */}
                {task.helpRequested && (
                  <div className="ml-5.5 mb-3 p-2 rounded-xl bg-[#FFF7ED] border border-[#FDBA74] text-xs font-semibold text-[#9A3412] flex items-center justify-between">
                    <span>🆘 Help needed: {task.helpReason || 'Assistance requested'}</span>
                    {(isAdmin || isCoordinator) && (
                      <button
                        onClick={() => onReassignTask(task)}
                        className="underline text-[11px] font-bold"
                      >
                        Reassign Now
                      </button>
                    )}
                  </div>
                )}

                {/* Status Switcher & Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#F2ECE1] pl-5.5 gap-2">
                  {/* Status Pills / Actions */}
                  <div className="flex items-center gap-1">
                    {/* Status switcher for assigned member or leader */}
                    <button
                      onClick={() => updateTaskStatus(task.id, 'PENDING')}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                        isPending
                          ? 'bg-[#EA580C] text-white'
                          : 'text-[#7C6A58] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      Pending
                    </button>

                    <button
                      onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                        isInProgress
                          ? 'bg-[#D97706] text-white'
                          : 'text-[#7C6A58] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                        isCompleted
                          ? 'bg-[#15803D] text-white'
                          : 'text-[#7C6A58] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      Completed
                    </button>
                  </div>

                  {/* Contextual Secondary Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isAssignedToMe && isPending && (
                      <button
                        onClick={() => onDeclineTask(task)}
                        className="text-[11px] font-semibold text-[#DC2626] hover:underline"
                      >
                        Can&apos;t Do
                      </button>
                    )}

                    {isAssignedToMe && isInProgress && !task.helpRequested && (
                      <button
                        onClick={() => requestTaskHelp(task.id)}
                        className="text-[11px] font-bold text-[#EA580C] hover:underline"
                      >
                        Need Help
                      </button>
                    )}

                    {(isAdmin || isCoordinator) && (
                      <button
                        onClick={() => onReassignTask(task)}
                        className="text-[11px] font-semibold text-[#7C6A58] hover:text-[#4A3525] hover:underline"
                      >
                        Reassign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
