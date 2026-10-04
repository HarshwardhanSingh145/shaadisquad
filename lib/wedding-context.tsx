'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { User, Wedding, Task, JoinRequest, TimelineEvent, AppNotification, TaskPriority, TaskStatus, UserRole, VoiceNote } from './types';
import { playNotificationChime } from './sound';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  FirebaseUser,
  handleFirestoreError,
  OperationType
} from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

interface WeddingContextType {
  wedding: Wedding | null;
  currentUser: User | null;
  teamMembers: User[];
  tasks: Task[];
  timeline: TimelineEvent[];
  joinRequests: JoinRequest[];
  voiceNotes: VoiceNote[];
  notifications: AppNotification[];
  activeNotification: AppNotification | null;
  
  // Firebase Auth
  firebaseUser: FirebaseUser | null;
  isAuthLoading: boolean;
  hasStartedSession: boolean;
  startSession: (asUser?: User) => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  
  // Actions
  createWedding: (weddingData: { name: string; coupleName: string; date: string; adminName: string }) => Wedding;
  joinWedding: (code: string, userName: string, requestedRole: UserRole) => { success: boolean; message: string };
  approveJoinRequest: (requestId: string) => void;
  rejectJoinRequest: (requestId: string) => void;
  
  sendVoiceNote: (data: { recipientId: string; audioUrl: string; durationSeconds: number; transcription?: string }) => VoiceNote;
  deleteVoiceNote: (id: string) => void;
  
  createTask: (data: {
    title: string;
    category?: string;
    assignedUserId: string;
    dueTime: string;
    location: string;
    priority: TaskPriority;
    isQuickTask?: boolean;
    description?: string;
  }) => Task;
  createQuickTask: (data: { title: string; category?: string; assignedUserId: string; dueTime: string; location: string }) => Task;
  
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  declineTask: (taskId: string, reason: string) => void;
  reassignTask: (taskId: string, newUserId: string) => void;
  requestTaskHelp: (taskId: string, reason?: string) => void;
  resolveTaskHelp: (taskId: string) => void;
  
  updateMemberRole: (userId: string, newRole: UserRole) => void;
  removeMember: (userId: string) => void;
  toggleLocationSharing: (enabled: boolean) => void;
  
  // Timeline management
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  deleteTimelineEvent: (id: string) => void;
  
  // Testing & Persona switching
  switchUser: (userId: string) => void;
  leaveWedding: () => void;
  resetToSampleData: () => void;
  dismissNotification: (id: string) => void;
}

const STORAGE_KEY = 'shaadi_squad_data_v2';
const CURRENT_USER_KEY = 'shaadi_squad_current_user_v2';

const INITIAL_WEDDING: Wedding = {
  id: 'wed-sharma-2026',
  name: 'Sharma Wedding',
  coupleName: 'Pooja & Rahul',
  date: '2026-10-04',
  weddingCode: '482731',
  adminId: 'u-aman',
  dayNumber: 2,
  status: 'ACTIVE',
};

const INITIAL_MEMBERS: User[] = [
  {
    id: 'u-aman',
    name: 'Aman',
    role: 'ADMIN',
    locationSharing: true,
    latitude: 28.5355,
    longitude: 77.3910,
    currentVenueArea: 'Hotel Lobby / Main Gate',
    availability: 'AVAILABLE',
  },
  {
    id: 'u-priya',
    name: 'Priya',
    role: 'COORDINATOR',
    locationSharing: true,
    latitude: 28.5358,
    longitude: 77.3915,
    currentVenueArea: 'Mandap Ground',
    availability: 'AVAILABLE',
  },
  {
    id: 'u-rahul',
    name: 'Rahul',
    role: 'MEMBER',
    locationSharing: true,
    latitude: 28.5365,
    longitude: 77.3920,
    currentVenueArea: 'Hotel Lawn',
    availability: 'AVAILABLE',
  },
  {
    id: 'u-vikas',
    name: 'Vikas',
    role: 'MEMBER',
    locationSharing: true,
    latitude: 28.5390,
    longitude: 77.3940,
    currentVenueArea: 'Guest Wing / Room 204',
    availability: 'BUSY',
  },
  {
    id: 'u-rohit',
    name: 'Rohit',
    role: 'MEMBER',
    locationSharing: true,
    latitude: 28.5375,
    longitude: 77.3930,
    currentVenueArea: 'Main Parking & Valet',
    availability: 'AVAILABLE',
  },
  {
    id: 'u-sneha',
    name: 'Sneha',
    role: 'MEMBER',
    locationSharing: false, // Respects privacy setting
    currentVenueArea: 'Catering & Dining Hall',
    availability: 'AVAILABLE',
  },
];

const BASE_TIMESTAMP = 1728000000000;

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    weddingId: 'wed-sharma-2026',
    title: 'Pickup Wedding Cards',
    category: 'Logistics',
    description: 'Collect final boxed batch from Raj Printers counter',
    assignedUserId: 'u-rahul',
    assignedUserName: 'Rahul',
    createdByUserId: 'u-aman',
    createdByName: 'Aman',
    priority: 'NORMAL',
    status: 'PENDING',
    dueTime: '11:30 AM',
    location: 'Wedding Venue Front Desk',
    isQuickTask: false,
    createdAt: BASE_TIMESTAMP - 7200000,
  },
  {
    id: 't-2',
    weddingId: 'wed-sharma-2026',
    title: 'Guest Room Check',
    category: 'Hospitality',
    description: 'Ensure welcome hampers and key cards are ready in 2nd floor suite',
    assignedUserId: 'u-rahul',
    assignedUserName: 'Rahul',
    createdByUserId: 'u-priya',
    createdByName: 'Priya',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    dueTime: 'ASAP',
    location: 'Hotel 2nd Floor',
    isQuickTask: true,
    createdAt: BASE_TIMESTAMP - 3600000,
  },
  {
    id: 't-3',
    weddingId: 'wed-sharma-2026',
    title: 'Decoration Check',
    category: 'Decoration',
    description: 'Verify floral setup and lighting on main mandap',
    assignedUserId: 'u-vikas',
    assignedUserName: 'Vikas',
    createdByUserId: 'u-aman',
    createdByName: 'Aman',
    priority: 'NORMAL',
    status: 'COMPLETED',
    dueTime: '10:00 AM',
    location: 'Mandap Ground',
    isQuickTask: false,
    createdAt: BASE_TIMESTAMP - 14400000,
  },
  {
    id: 't-4',
    weddingId: 'wed-sharma-2026',
    title: 'Photographer Welcoming & Room Guide',
    category: 'Photo & Video',
    description: 'Lead the camera crew to Green Room A for battery charging and kit setup',
    assignedUserId: 'u-rohit',
    assignedUserName: 'Rohit',
    createdByUserId: 'u-aman',
    createdByName: 'Aman',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    dueTime: 'ASAP',
    location: 'Hotel Lobby',
    isQuickTask: true,
    createdAt: BASE_TIMESTAMP - 900000,
  },
  {
    id: 't-5',
    weddingId: 'wed-sharma-2026',
    title: 'Stage Sound & Mic Check',
    category: 'Ceremony',
    description: 'Test wireless mics with DJ console before 4 PM',
    assignedUserId: 'u-rahul',
    assignedUserName: 'Rahul',
    createdByUserId: 'u-aman',
    createdByName: 'Aman',
    priority: 'NORMAL',
    status: 'PENDING',
    dueTime: '03:00 PM',
    location: 'Main Stage',
    isQuickTask: false,
    createdAt: BASE_TIMESTAMP - 3600000,
  },
];

const INITIAL_TIMELINE: TimelineEvent[] = [
  { id: 'ev-1', time: '10:00 AM', title: 'Decoration & Stage Setup', location: 'Mandap & Lawn' },
  { id: 'ev-2', time: '12:00 PM', title: 'Guest Arrival & Welcome Drink', location: 'Hotel Lobby' },
  { id: 'ev-3', time: '04:00 PM', title: 'Haldi Ceremony', location: 'Garden Courtyard', isCurrent: true },
  { id: 'ev-4', time: '07:00 PM', title: 'Sangeet & Dinner Celebration', location: 'Grand Ballroom' },
];

const INITIAL_JOIN_REQUESTS: JoinRequest[] = [
  {
    id: 'jr-1',
    weddingId: 'wed-sharma-2026',
    userName: 'Karan Mehra',
    requestedRole: 'MEMBER',
    timestamp: BASE_TIMESTAMP - 1200000,
    status: 'PENDING',
  },
];

const INITIAL_VOICE_NOTES: VoiceNote[] = [
  {
    id: 'vn-1',
    weddingId: 'wed-sharma-2026',
    senderId: 'u-aman',
    senderName: 'Aman',
    senderRole: 'ADMIN',
    recipientId: 'ALL',
    recipientName: 'Whole Squad',
    audioUrl: '',
    durationSeconds: 6,
    timestamp: BASE_TIMESTAMP - 600000,
    transcription: 'Baraat has reached the main gate! Everyone please move to your assigned stations.',
    listened: false,
  },
  {
    id: 'vn-2',
    weddingId: 'wed-sharma-2026',
    senderId: 'u-priya',
    senderName: 'Priya',
    senderRole: 'COORDINATOR',
    recipientId: 'u-rahul',
    recipientName: 'Rahul',
    audioUrl: '',
    durationSeconds: 4,
    timestamp: BASE_TIMESTAMP - 300000,
    transcription: 'Rahul, please check if the guest room keys on 2nd floor are arranged.',
    listened: true,
  },
];

function getInitialData() {
  if (typeof window === 'undefined') {
    return {
      wedding: null,
      teamMembers: [],
      tasks: [],
      timeline: [],
      joinRequests: [],
      voiceNotes: [],
      currentUser: null,
    };
  }
  try {
    // Only restore wedding if user is authenticated or demo mode was set in session
    const isDemo = sessionStorage.getItem('shaadi_squad_demo_mode') === 'true';
    if (!isDemo && !auth.currentUser) {
      return {
        wedding: null,
        teamMembers: [],
        tasks: [],
        timeline: [],
        joinRequests: [],
        voiceNotes: [],
        currentUser: null,
      };
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.wedding) {
        const members = parsed.teamMembers || [];
        const storedUserId = localStorage.getItem(CURRENT_USER_KEY);
        const user = members.find((m: User) => m.id === storedUserId) || members[0] || null;
        return {
          wedding: parsed.wedding,
          teamMembers: members,
          tasks: parsed.tasks || [],
          timeline: parsed.timeline || [],
          joinRequests: parsed.joinRequests || [],
          voiceNotes: parsed.voiceNotes || [],
          currentUser: user,
        };
      }
    }
  } catch {
    // storage read error fallback
  }
  return {
    wedding: null,
    teamMembers: [],
    tasks: [],
    timeline: [],
    joinRequests: [],
    voiceNotes: [],
    currentUser: null,
  };
}

const WeddingContext = createContext<WeddingContextType | null>(null);

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [wedding, setWedding] = useState<Wedding | null>(() => getInitialData().wedding);
  const [teamMembers, setTeamMembers] = useState<User[]>(() => getInitialData().teamMembers);
  const [tasks, setTasks] = useState<Task[]>(() => getInitialData().tasks);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => getInitialData().timeline);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(() => getInitialData().joinRequests);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>(() => getInitialData().voiceNotes);
  const [currentUser, setCurrentUser] = useState<User | null>(() => getInitialData().currentUser);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [hasStartedSession, setHasStartedSession] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('shaadi_squad_demo_mode') === 'true';
  });

  const startSession = useCallback((asUser?: User) => {
    setHasStartedSession(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('shaadi_squad_demo_mode', 'true');
    }
    if (asUser) {
      setCurrentUser(asUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, asUser.id);
      }
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthLoading(false);

      if (user) {
        setHasStartedSession(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('shaadi_squad_session_started', 'true');
        }

        // Link with squad identity
        setTeamMembers((prev) => {
          const exists = prev.some((m) => m.id === user.uid || m.email === user.email);
          if (exists) {
            return prev.map((m) =>
              m.id === user.uid || m.email === user.email
                ? {
                    ...m,
                    id: user.uid,
                    name: user.displayName || m.name,
                    email: user.email || m.email,
                    photoURL: user.photoURL || undefined,
                  }
                : m
            );
          } else {
            const newMember: User = {
              id: user.uid,
              name: user.displayName || 'Google User',
              email: user.email || undefined,
              photoURL: user.photoURL || undefined,
              role: 'ADMIN',
              locationSharing: true,
              latitude: 28.5360,
              longitude: 77.3915,
              currentVenueArea: 'Hotel Lobby / Welcome Gate',
              availability: 'AVAILABLE',
            };
            return [...prev, newMember];
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Post a notification banner and optional sound
  const pushNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const item: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [item, ...prev]);
    setActiveNotification(item);

    if (notification.type === 'QUICK_TASK') {
      playNotificationChime('urgent');
    } else if (notification.type === 'HELP_REQUEST') {
      playNotificationChime('alert');
    } else {
      playNotificationChime('normal');
    }

    // Auto dismiss active banner after 5.5s
    setTimeout(() => {
      setActiveNotification((curr) => (curr?.id === item.id ? null : curr));
    }, 5500);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setActiveNotification((curr) => (curr?.id === id ? null : curr));
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  // Sign In with Google popup
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        setFirebaseUser(user);
        pushNotification({
          title: 'Google Sign-In Successful',
          message: `Logged in as ${user.displayName || user.email}`,
          type: 'APPROVED',
        });
      }
    } catch (error) {
      console.error('Google Sign-in Error:', error);
      pushNotification({
        title: 'Sign-In Notice',
        message: error instanceof Error ? error.message : 'Google Sign-In popup was closed or interrupted.',
        type: 'APPROVED',
      });
    }
  }, [pushNotification]);

  // Sign out
  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setHasStartedSession(false);
      setWedding(null);
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('shaadi_squad_demo_mode');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem('shaadi_squad_session_started');
      }
      pushNotification({
        title: 'Signed Out',
        message: 'Signed out from account.',
        type: 'APPROVED',
      });
    } catch (error) {
      console.error('Sign out Error:', error);
    }
  }, [pushNotification]);

  // Save to localStorage
  const saveState = useCallback((
    newWedding: Wedding | null,
    newMembers: User[],
    newTasks: Task[],
    newTimeline: TimelineEvent[],
    newRequests: JoinRequest[],
    newVoiceNotes: VoiceNote[] = voiceNotes
  ) => {
    try {
      const data = {
        wedding: newWedding,
        teamMembers: newMembers,
        tasks: newTasks,
        timeline: newTimeline,
        joinRequests: newRequests,
        voiceNotes: newVoiceNotes,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // Broadcast to other tabs for immediate real-time synchronization
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('shaadi_squad_sync');
        channel.postMessage({ type: 'STATE_UPDATED', data });
        channel.close();
      }
    } catch {
      // Storage error fallback
    }
  }, [voiceNotes]);

  // Broadcast channel listener
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('shaadi_squad_sync');
    channel.onmessage = (event) => {
      if (event.data?.type === 'STATE_UPDATED' && event.data.data) {
        const { wedding: w, teamMembers: m, tasks: t, timeline: tl, joinRequests: jr, voiceNotes: vn } = event.data.data;
        if (w) setWedding(w);
        if (m) setTeamMembers(m);
        if (t) setTasks(t);
        if (tl) setTimeline(tl);
        if (jr) setJoinRequests(jr);
        if (vn) setVoiceNotes(vn);
      }
    };
    return () => {
      channel.close();
    };
  }, []);

  // Switch current active user (for instant multi-role testing)
  const switchUser = useCallback((userId: string) => {
    const user = teamMembers.find((m) => m.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, user.id);
      playNotificationChime('normal');
    }
  }, [teamMembers]);

  // Create wedding
  const createWedding = useCallback((weddingData: { name: string; coupleName: string; date: string; adminName: string }) => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const adminUser: User = {
      id: firebaseUser?.uid || `u-${Date.now()}`,
      name: weddingData.adminName.trim() || firebaseUser?.displayName || 'Admin',
      email: firebaseUser?.email || undefined,
      photoURL: firebaseUser?.photoURL || undefined,
      role: 'ADMIN',
      locationSharing: true,
      currentVenueArea: 'Main Entrance / Hotel Lobby',
      availability: 'AVAILABLE',
      latitude: 28.5355,
      longitude: 77.3910,
    };

    const newWedding: Wedding = {
      id: `wed-${Date.now()}`,
      name: weddingData.name.trim() || 'My Wedding',
      coupleName: weddingData.coupleName.trim() || 'Bride & Groom',
      date: weddingData.date || new Date().toISOString().split('T')[0],
      weddingCode: randomCode,
      adminId: adminUser.id,
      dayNumber: 1,
      status: 'ACTIVE',
    };

    const newMembers = [adminUser];
    const newTasks: Task[] = [];
    const newTimeline: TimelineEvent[] = [
      { id: 'ev-1', time: '10:00 AM', title: 'Decoration Check', location: 'Venue' },
      { id: 'ev-2', time: '01:00 PM', title: 'Lunch & Arrival', location: 'Dining Hall' },
      { id: 'ev-3', time: '05:00 PM', title: 'Main Ceremony', location: 'Mandap', isCurrent: true },
      { id: 'ev-4', time: '08:00 PM', title: 'Dinner Reception', location: 'Banquet Hall' },
    ];
    const newRequests: JoinRequest[] = [];

    setWedding(newWedding);
    setTeamMembers(newMembers);
    setTasks(newTasks);
    setTimeline(newTimeline);
    setJoinRequests(newRequests);
    setCurrentUser(adminUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, adminUser.id);
      localStorage.setItem('shaadi_squad_session_started', 'true');
    }
    setHasStartedSession(true);
    saveState(newWedding, newMembers, newTasks, newTimeline, newRequests);

    pushNotification({
      title: 'Wedding Created',
      message: `Wedding Code is ${randomCode}. Share with your team!`,
      type: 'APPROVED',
    });

    return newWedding;
  }, [firebaseUser, saveState, pushNotification]);

  // Join Wedding Request
  const joinWedding = useCallback((code: string, userName: string, requestedRole: UserRole) => {
    const codeMatch = (wedding && wedding.weddingCode === code.trim()) || code.trim() === '482731';
    if (!codeMatch) {
      return { success: false, message: 'Invalid Wedding Code. Please check with your Admin.' };
    }

    const targetWedding = wedding || INITIAL_WEDDING;
    const newUser: User = {
      id: firebaseUser?.uid || `u-${Date.now()}`,
      name: userName.trim() || firebaseUser?.displayName || 'Team Member',
      email: firebaseUser?.email || undefined,
      photoURL: firebaseUser?.photoURL || undefined,
      role: requestedRole,
      locationSharing: true,
      currentVenueArea: 'Hotel Reception',
      availability: 'AVAILABLE',
      latitude: 28.5360 + (Math.random() - 0.5) * 0.003,
      longitude: 77.3915 + (Math.random() - 0.5) * 0.003,
    };

    const updatedMembers = [...teamMembers.filter((m) => m.id !== newUser.id), newUser];
    setWedding(targetWedding);
    setTeamMembers(updatedMembers);
    setCurrentUser(newUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, newUser.id);
      localStorage.setItem('shaadi_squad_session_started', 'true');
    }
    setHasStartedSession(true);
    saveState(targetWedding, updatedMembers, tasks, timeline, joinRequests);

    pushNotification({
      title: 'Joined Wedding Squad!',
      message: `Welcome ${newUser.name} to ${targetWedding.name}!`,
      type: 'APPROVED',
    });

    return { success: true, message: `Welcome to ${targetWedding.name}!` };
  }, [wedding, teamMembers, tasks, timeline, joinRequests, firebaseUser, saveState, pushNotification]);

  // Approve Join Request
  const approveJoinRequest = useCallback((requestId: string) => {
    const req = joinRequests.find((r) => r.id === requestId);
    if (!req || !wedding) return;

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: req.userName,
      role: req.requestedRole,
      locationSharing: true,
      currentVenueArea: 'Hotel Reception',
      availability: 'AVAILABLE',
      latitude: 28.5360 + (Math.random() - 0.5) * 0.003,
      longitude: 77.3915 + (Math.random() - 0.5) * 0.003,
    };

    const updatedMembers = [...teamMembers, newUser];
    const updatedRequests = joinRequests.filter((r) => r.id !== requestId);

    setTeamMembers(updatedMembers);
    setJoinRequests(updatedRequests);
    saveState(wedding, updatedMembers, tasks, timeline, updatedRequests);

    pushNotification({
      title: 'Member Approved',
      message: `${newUser.name} is now part of ${wedding.name}!`,
      type: 'APPROVED',
    });
  }, [joinRequests, wedding, teamMembers, tasks, timeline, saveState, pushNotification]);

  // Reject Join Request
  const rejectJoinRequest = useCallback((requestId: string) => {
    const req = joinRequests.find((r) => r.id === requestId);
    const updatedRequests = joinRequests.filter((r) => r.id !== requestId);
    setJoinRequests(updatedRequests);
    saveState(wedding, teamMembers, tasks, timeline, updatedRequests);

    if (req) {
      pushNotification({
        title: 'Request Declined',
        message: `Join request from ${req.userName} was declined.`,
        type: 'JOIN_REQUEST',
      });
    }
  }, [joinRequests, wedding, teamMembers, tasks, timeline, saveState, pushNotification]);

  // Create Standard Task
  const createTask = useCallback((data: {
    title: string;
    category?: string;
    assignedUserId: string;
    dueTime: string;
    location: string;
    priority: TaskPriority;
    isQuickTask?: boolean;
    description?: string;
  }) => {
    const assignedUser = teamMembers.find((m) => m.id === data.assignedUserId);
    const newTask: Task = {
      id: `t-${Date.now()}`,
      weddingId: wedding?.id || 'wed-active',
      title: data.title.trim(),
      category: data.category?.trim() || (data.isQuickTask ? 'Urgent' : 'General'),
      description: data.description?.trim(),
      assignedUserId: data.assignedUserId,
      assignedUserName: assignedUser?.name || 'Unassigned',
      createdByUserId: currentUser?.id || 'u-admin',
      createdByName: currentUser?.name || 'Admin',
      priority: data.priority,
      status: 'PENDING',
      dueTime: data.dueTime || 'ASAP',
      location: data.location.trim() || 'Wedding Venue',
      isQuickTask: Boolean(data.isQuickTask),
      createdAt: Date.now(),
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveState(wedding, teamMembers, updatedTasks, timeline, joinRequests);

    // Notify assigned member
    pushNotification({
      title: data.isQuickTask ? '🔴 QUICK TASK' : 'New Task Assigned',
      message: `${newTask.title} • 📍 ${newTask.location} • ${newTask.dueTime}`,
      type: data.isQuickTask ? 'QUICK_TASK' : 'NEW_TASK',
      taskId: newTask.id,
    });

    return newTask;
  }, [teamMembers, wedding, currentUser, tasks, saveState, timeline, joinRequests, pushNotification]);

  // Create Quick Task (Fast path for urgent work)
  const createQuickTask = useCallback((data: {
    title: string;
    category?: string;
    assignedUserId: string;
    dueTime: string;
    location: string;
  }) => {
    return createTask({
      ...data,
      category: data.category || 'Urgent',
      priority: 'URGENT',
      isQuickTask: true,
    });
  }, [createTask]);

  // Update Task Status
  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    let completedTaskName = '';
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        if (status === 'COMPLETED') completedTaskName = t.title;
        return { ...t, status, helpRequested: status === 'COMPLETED' ? false : t.helpRequested };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveState(wedding, teamMembers, updatedTasks, timeline, joinRequests);

    if (status === 'COMPLETED') {
      playNotificationChime('complete');
      pushNotification({
        title: 'Task Completed 🟢',
        message: `${completedTaskName} has been marked finished!`,
        type: 'APPROVED',
      });
    } else {
      playNotificationChime('normal');
    }
  }, [tasks, wedding, teamMembers, timeline, joinRequests, saveState, pushNotification]);

  // Decline Task ("Can't Do")
  const declineTask = useCallback((taskId: string, reason: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'PENDING' as TaskStatus,
          declinedReason: reason,
          helpRequested: true,
          helpReason: `Can't do: ${reason}`,
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveState(wedding, teamMembers, updatedTasks, timeline, joinRequests);

    pushNotification({
      title: `⚠️ Task Declined by ${task.assignedUserName}`,
      message: `${task.title} — Reason: "${reason}". Please reassign!`,
      type: 'HELP_REQUEST',
      taskId: task.id,
    });
  }, [tasks, wedding, teamMembers, timeline, joinRequests, saveState, pushNotification]);

  // Reassign Task
  const reassignTask = useCallback((taskId: string, newUserId: string) => {
    const targetUser = teamMembers.find((m) => m.id === newUserId);
    if (!targetUser) return;

    const task = tasks.find((t) => t.id === taskId);
    const oldAssigneeName = task?.assignedUserName || 'Previous member';

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          assignedUserId: targetUser.id,
          assignedUserName: targetUser.name,
          helpRequested: false,
          helpReason: undefined,
          declinedReason: undefined,
          status: 'PENDING' as TaskStatus,
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveState(wedding, teamMembers, updatedTasks, timeline, joinRequests);

    pushNotification({
      title: 'Task Reassigned',
      message: `${task?.title || 'Task'} moved from ${oldAssigneeName} to ${targetUser.name}.`,
      type: 'REASSIGNED',
      taskId,
    });
  }, [teamMembers, tasks, wedding, timeline, joinRequests, saveState, pushNotification]);

  // Request Help on Task ("Need Help")
  const requestTaskHelp = useCallback((taskId: string, reason?: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          helpRequested: true,
          helpReason: reason || 'Needs assistance on location',
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveState(wedding, teamMembers, updatedTasks, timeline, joinRequests);

    pushNotification({
      title: `🆘 ${currentUser?.name || task.assignedUserName} Needs Help!`,
      message: `On "${task.title}" at 📍 ${task.location}. Tap to reassign or assist.`,
      type: 'HELP_REQUEST',
      taskId: task.id,
    });
  }, [tasks, wedding, teamMembers, timeline, joinRequests, saveState, pushNotification, currentUser]);

  const resolveTaskHelp = useCallback((taskId: string) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, helpRequested: false, helpReason: undefined };
      }
      return t;
    });
    setTasks(updatedTasks);
    saveState(wedding, teamMembers, updatedTasks, timeline, joinRequests);
  }, [tasks, wedding, teamMembers, timeline, joinRequests, saveState]);

  // Update Member Role
  const updateMemberRole = useCallback((userId: string, newRole: UserRole) => {
    const updatedMembers = teamMembers.map((m) => {
      if (m.id === userId) {
        return { ...m, role: newRole };
      }
      return m;
    });

    setTeamMembers(updatedMembers);
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
    saveState(wedding, updatedMembers, tasks, timeline, joinRequests);

    pushNotification({
      title: 'Role Updated',
      message: `Member role set to ${newRole}.`,
      type: 'APPROVED',
    });
  }, [teamMembers, currentUser, wedding, tasks, timeline, joinRequests, saveState, pushNotification]);

  // Remove Member
  const removeMember = useCallback((userId: string) => {
    const memberToRemove = teamMembers.find((m) => m.id === userId);
    if (!memberToRemove || memberToRemove.role === 'ADMIN') return;

    const updatedMembers = teamMembers.filter((m) => m.id !== userId);
    setTeamMembers(updatedMembers);
    saveState(wedding, updatedMembers, tasks, timeline, joinRequests);

    pushNotification({
      title: 'Member Removed',
      message: `${memberToRemove.name} was removed from the squad.`,
      type: 'JOIN_REQUEST',
    });
  }, [teamMembers, wedding, tasks, timeline, joinRequests, saveState, pushNotification]);

  // Toggle Location Sharing
  const toggleLocationSharing = useCallback((enabled: boolean) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, locationSharing: enabled };
    setCurrentUser(updatedUser);

    const updatedMembers = teamMembers.map((m) => (m.id === currentUser.id ? updatedUser : m));
    setTeamMembers(updatedMembers);
    saveState(wedding, updatedMembers, tasks, timeline, joinRequests);

    pushNotification({
      title: enabled ? 'Location Sharing ON 📍' : 'Location Sharing OFF 🔒',
      message: enabled
        ? 'Your location is visible only to your wedding squad for rapid coordination.'
        : 'Your location sharing has stopped.',
      type: 'APPROVED',
    });
  }, [currentUser, teamMembers, wedding, tasks, timeline, joinRequests, saveState, pushNotification]);

  // Timeline
  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `ev-${Date.now()}`,
    };
    const updated = [...timeline, newEvent];
    setTimeline(updated);
    saveState(wedding, teamMembers, tasks, updated, joinRequests);
  }, [timeline, wedding, teamMembers, tasks, joinRequests, saveState]);

  const deleteTimelineEvent = useCallback((id: string) => {
    const updated = timeline.filter((e) => e.id !== id);
    setTimeline(updated);
    saveState(wedding, teamMembers, tasks, updated, joinRequests);
  }, [timeline, wedding, teamMembers, tasks, joinRequests, saveState]);

  // Leave wedding
  const leaveWedding = useCallback(() => {
    setWedding(null);
    setCurrentUser(null);
    setTeamMembers([]);
    setTasks([]);
    setTimeline([]);
    setJoinRequests([]);
    setVoiceNotes([]);
    setHasStartedSession(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('shaadi_squad_demo_mode');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem('shaadi_squad_session_started');
    }
  }, []);

  // Send Voice Note (Walkie-Talkie)
  const sendVoiceNote = useCallback((data: {
    recipientId: string;
    audioUrl: string;
    durationSeconds: number;
    transcription?: string;
  }) => {
    const targetMember = teamMembers.find((m) => m.id === data.recipientId);
    const recipientName = data.recipientId === 'ALL' ? 'Whole Squad' : (targetMember?.name || 'Teammate');

    const newNote: VoiceNote = {
      id: `vn-${Date.now()}`,
      weddingId: wedding?.id || 'wed-active',
      senderId: currentUser?.id || 'u-user',
      senderName: currentUser?.name || 'Squad Member',
      senderRole: currentUser?.role || 'MEMBER',
      recipientId: data.recipientId,
      recipientName,
      audioUrl: data.audioUrl,
      durationSeconds: Math.max(data.durationSeconds, 1),
      timestamp: Date.now(),
      transcription: data.transcription?.trim() || undefined,
      listened: false,
    };

    const updatedNotes = [newNote, ...voiceNotes];
    setVoiceNotes(updatedNotes);
    saveState(wedding, teamMembers, tasks, timeline, joinRequests, updatedNotes);

    playNotificationChime('voice');
    pushNotification({
      title: `🎙️ Voice Note from ${currentUser?.name}`,
      message: data.recipientId === 'ALL'
        ? `Broadcast to Squad: "${data.transcription || 'Audio message'}"`
        : `To ${recipientName}: "${data.transcription || 'Audio message'}"`,
      type: 'VOICE_NOTE',
      voiceNoteId: newNote.id,
    });

    return newNote;
  }, [currentUser, teamMembers, wedding, voiceNotes, tasks, timeline, joinRequests, saveState, pushNotification]);

  const deleteVoiceNote = useCallback((id: string) => {
    const updated = voiceNotes.filter((v) => v.id !== id);
    setVoiceNotes(updated);
    saveState(wedding, teamMembers, tasks, timeline, joinRequests, updated);
  }, [voiceNotes, wedding, teamMembers, tasks, timeline, joinRequests, saveState]);

  // Reset to default sample
  const resetToSampleData = useCallback(() => {
    setWedding(INITIAL_WEDDING);
    setTeamMembers(INITIAL_MEMBERS);
    setTasks(INITIAL_TASKS);
    setTimeline(INITIAL_TIMELINE);
    setJoinRequests(INITIAL_JOIN_REQUESTS);
    setCurrentUser(INITIAL_MEMBERS[0]);
    setHasStartedSession(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('shaadi_squad_demo_mode', 'true');
      localStorage.setItem(CURRENT_USER_KEY, INITIAL_MEMBERS[0].id);
      localStorage.setItem('shaadi_squad_session_started', 'true');
    }
    saveState(INITIAL_WEDDING, INITIAL_MEMBERS, INITIAL_TASKS, INITIAL_TIMELINE, INITIAL_JOIN_REQUESTS);
    pushNotification({
      title: 'Demo Data Restored',
      message: 'Sharma Wedding sample team and tasks ready!',
      type: 'APPROVED',
    });
  }, [saveState, pushNotification]);

  return (
    <WeddingContext.Provider
      value={{
        wedding,
        currentUser,
        teamMembers,
        tasks,
        timeline,
        joinRequests,
        voiceNotes,
        notifications,
        activeNotification,
        firebaseUser,
        isAuthLoading,
        hasStartedSession,
        startSession,
        signInWithGoogle,
        signOutUser,
        createWedding,
        joinWedding,
        approveJoinRequest,
        rejectJoinRequest,
        sendVoiceNote,
        deleteVoiceNote,
        createTask,
        createQuickTask,
        updateTaskStatus,
        declineTask,
        reassignTask,
        requestTaskHelp,
        resolveTaskHelp,
        updateMemberRole,
        removeMember,
        toggleLocationSharing,
        addTimelineEvent,
        deleteTimelineEvent,
        switchUser,
        leaveWedding,
        resetToSampleData,
        dismissNotification,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
}
