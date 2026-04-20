import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Friend } from '@/types/database';
import type { FriendFormData } from '@/lib/validators';

const AVATAR_COLORS = [
  '#e85d4c', '#4a90d9', '#50b86c', '#f5a623',
  '#9b59b6', '#1abc9c', '#e67e22', '#3498db',
];

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function useFriends() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Friend[];
    },
    enabled: Boolean(user),
  });
}

export function useAddFriend() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (friend: FriendFormData) => {
      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: user!.id,
          name: friend.name,
          location: friend.location,
          avatar_color: randomColor(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as Friend;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useUpdateFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: FriendFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('friends')
        .update({
          name: updates.name,
          location: updates.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Friend;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useDeleteFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}
