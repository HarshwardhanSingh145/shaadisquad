export type UserRole = 'ADMIN' | 'COORDINATOR' | 'MEMBER';

export type TaskPriority = 'NORMAL' | 'URGENT';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'NEEDS_HELP';

export interface User {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  locationSharing: boolean;
  latitude?: number;
  longitude?: number;
  currentVenueArea?: string; // e.g. "Hotel Lobby", "Mandap Ground", "Banquet Hall"
  availability: AvailabilityStatus;
}

export interface Wedding {
  id: string;
  name: string; // e.g. "Sharma Wedding"
  coupleName: string; // e.g. "Pooja & Rahul"
  date: string; // e.g. "2026-10-04"
  weddingCode: string; // 6-digit code e.g. "482731"
  adminId: string;
  dayNumber: number; // e.g. 2
  status: 'ACTIVE' | 'CONCLUDED';
}

export type TaskCategory =
  | 'Logistics'
  | 'Decoration'
  | 'Catering'
  | 'Hospitality'
  | 'Ceremony'
  | 'Photo & Video'
  | 'General';

export const DEFAULT_TASK_CATEGORIES: TaskCategory[] = [
  'Logistics',
  'Decoration',
  'Catering',
  'Hospitality',
  'Ceremony',
  'Photo & Video',
];

export interface Task {
  id: string;
  weddingId: string;
  title: string;
  category?: string;
  description?: string;
  assignedUserId: string;
  assignedUserName: string;
  createdByUserId: string;
  createdByName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueTime: string; // e.g. "11:30 AM" or "ASAP" or "Within 15 min"
  location: string; // e.g. "Wedding Venue", "Hotel Room 204"
  isQuickTask: boolean;
  createdAt: number;
  helpRequested?: boolean;
  helpReason?: string;
  declinedReason?: string;
}

export interface JoinRequest {
  id: string;
  weddingId: string;
  userName: string;
  requestedRole: UserRole;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  isCurrent?: boolean;
}

export interface VoiceNote {
  id: string;
  weddingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string; // 'ALL' for squad broadcast, or specific user id
  recipientName: string; // 'Whole Squad' or user name
  audioUrl: string; // base64 data url, object url, or sound tone generator
  durationSeconds: number;
  timestamp: number;
  transcription?: string; // Short note/transcript
  listened: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'QUICK_TASK' | 'NEW_TASK' | 'HELP_REQUEST' | 'JOIN_REQUEST' | 'REASSIGNED' | 'APPROVED' | 'VOICE_NOTE';
  timestamp: number;
  read: boolean;
  taskId?: string;
  voiceNoteId?: string;
}
