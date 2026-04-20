import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FriendsList } from '@/components/friends/FriendsList';
import { AddFriendDialog } from '@/components/friends/AddFriendDialog';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { UserPlus, Users } from 'lucide-react';

export default function FriendsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded } = useGoogleMaps(apiKey);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">My Friends</h1>
              <p className="text-sm text-muted-foreground">
                Save your friends' locations for quick meetup planning
              </p>
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Friend
          </Button>
        </div>

        <FriendsList />

        <AddFriendDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          isGoogleLoaded={isLoaded}
        />
      </div>
    </div>
  );
}
