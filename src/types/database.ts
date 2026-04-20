export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  home_location: LocationData | null;
  created_at: string;
  updated_at: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface Friend {
  id: string;
  user_id: string;
  name: string;
  location: LocationData;
  avatar_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  friend_id: string;
}

export interface MeetupHistory {
  id: string;
  user_id: string;
  name: string | null;
  participants: Array<{ name: string; lat: number; lng: number; address?: string }>;
  meeting_point: { lat: number; lng: number };
  travel_mode: string | null;
  algorithm: string | null;
  total_distance: number | null;
  total_duration: number | null;
  share_token: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      friends: {
        Row: Friend;
        Insert: Omit<Friend, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Friend, 'id' | 'user_id' | 'created_at'>>;
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, 'id' | 'created_at'>;
        Update: Partial<Omit<Group, 'id' | 'user_id' | 'created_at'>>;
      };
      group_members: {
        Row: GroupMember;
        Insert: GroupMember;
        Update: never;
      };
      meetup_history: {
        Row: MeetupHistory;
        Insert: Omit<MeetupHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<MeetupHistory, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}
