import { useState } from 'react';
import { useFriends, useDeleteFriend } from '@/hooks/useFriends';
import { EditFriendDialog } from './EditFriendDialog';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Friend } from '@/types/database';
import { MapPin, Pencil, Trash2, Users } from 'lucide-react';

export function FriendsList() {
  const { data: friends, isLoading } = useFriends();
  const deleteFriend = useDeleteFriend();
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded } = useGoogleMaps(apiKey);

  const handleDelete = async (friend: Friend) => {
    try {
      await deleteFriend.mutateAsync(friend.id);
      toast.success(`${friend.name} removed`);
    } catch {
      toast.error('Failed to remove friend');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading friends...
      </div>
    );
  }

  if (!friends?.length) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="p-3 rounded-full bg-secondary inline-block">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No friends added yet</p>
        <p className="text-sm text-muted-foreground">
          Add friends with their locations to quickly plan meetups
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback
                style={{ backgroundColor: friend.avatar_color || '#4a5568' }}
                className="text-white text-sm font-medium"
              >
                {friend.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{friend.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {friend.location.address}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setEditingFriend(friend)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(friend)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <EditFriendDialog
        friend={editingFriend}
        open={Boolean(editingFriend)}
        onOpenChange={(open) => { if (!open) setEditingFriend(null); }}
        isGoogleLoaded={isLoaded}
      />
    </>
  );
}
