import { useState } from 'react';
import { useFriends } from '@/hooks/useFriends';
import { useAuth } from '@/hooks/useAuth';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Friend } from '@/types/database';
import { Users, Check, MapPin } from 'lucide-react';

interface FriendPickerProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriendIds: string[];
}

export function FriendPicker({ onSelectFriend, selectedFriendIds }: FriendPickerProps) {
  const { isLoggedIn } = useAuth();
  const { data: friends } = useFriends();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  if (!isLoggedIn) return null;

  const filteredFriends = friends?.filter(
    (f) => f.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full gap-2 justify-start text-muted-foreground">
          <Users className="h-4 w-4" />
          Add from friends...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-2 border-b border-border">
          <Input
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filteredFriends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {friends?.length ? 'No matches' : 'No friends saved yet'}
            </p>
          ) : (
            filteredFriends.map((friend) => {
              const isSelected = selectedFriendIds.includes(friend.id);
              return (
                <button
                  key={friend.id}
                  disabled={isSelected}
                  onClick={() => {
                    onSelectFriend(friend);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex items-center gap-2 w-full p-2 rounded-md text-left hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback
                      style={{ backgroundColor: friend.avatar_color || '#4a5568' }}
                      className="text-white text-xs font-medium"
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{friend.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      {friend.location.address}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
