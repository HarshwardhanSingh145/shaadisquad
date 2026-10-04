import { User } from './types';

// Distance calculation between users and relative venue areas
export interface MemberWithDistance {
  member: User;
  distanceMeters: number;
  distanceFormatted: string;
  isSharing: boolean;
}

// Fixed reference coordinates for Sharma Wedding venue (Hotel & Courtyard)
const VENUE_ANCHOR = {
  lat: 28.5355,
  lng: 77.3910,
};

// Standard approximate venue coordinates for distance modeling
const VENUE_PRESETS: Record<string, { lat: number; lng: number }> = {
  'Hotel Lobby / Main Gate': { lat: 28.5355, lng: 77.3910 },
  'Mandap Ground': { lat: 28.5359, lng: 77.3916 },
  'Hotel Lawn': { lat: 28.5367, lng: 77.3922 },
  'Catering & Dining Hall': { lat: 28.5372, lng: 77.3927 },
  'Main Parking & Valet': { lat: 28.5385, lng: 77.3938 },
  'Guest Wing / Room 204': { lat: 28.5405, lng: 77.3955 },
};

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateMemberDistance(
  targetMember: User,
  referenceMember?: User | null
): { distanceMeters: number; distanceFormatted: string; isSharing: boolean } {
  if (!targetMember.locationSharing) {
    return {
      distanceMeters: Infinity,
      distanceFormatted: 'Location Hidden',
      isSharing: false,
    };
  }

  const targetCoords = targetMember.latitude && targetMember.longitude
    ? { lat: targetMember.latitude, lng: targetMember.longitude }
    : targetMember.currentVenueArea && VENUE_PRESETS[targetMember.currentVenueArea]
    ? VENUE_PRESETS[targetMember.currentVenueArea]
    : VENUE_ANCHOR;

  const refCoords = referenceMember?.latitude && referenceMember?.longitude
    ? { lat: referenceMember.latitude, lng: referenceMember.longitude }
    : referenceMember?.currentVenueArea && VENUE_PRESETS[referenceMember.currentVenueArea]
    ? VENUE_PRESETS[referenceMember.currentVenueArea]
    : VENUE_ANCHOR;

  const meters = getHaversineDistance(
    refCoords.lat,
    refCoords.lng,
    targetCoords.lat,
    targetCoords.lng
  );

  // Friendly formatting
  let formatted = '';
  if (meters < 10) {
    formatted = 'Right here';
  } else if (meters < 1000) {
    formatted = `${Math.round(meters)} m away`;
  } else {
    formatted = `${(meters / 1000).toFixed(1)} km away`;
  }

  return {
    distanceMeters: meters,
    distanceFormatted: formatted,
    isSharing: true,
  };
}

export function sortMembersByDistance(
  members: User[],
  referenceMember?: User | null,
  excludeUserId?: string
): MemberWithDistance[] {
  return members
    .filter((m) => m.id !== excludeUserId)
    .map((member) => {
      const dist = calculateMemberDistance(member, referenceMember);
      return {
        member,
        ...dist,
      };
    })
    .sort((a, b) => {
      // Available members first, then by distance
      if (a.isSharing && !b.isSharing) return -1;
      if (!a.isSharing && b.isSharing) return 1;
      return a.distanceMeters - b.distanceMeters;
    });
}
