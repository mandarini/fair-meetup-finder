import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from '@/components/map/AddressAutocomplete';
import { useAddFriend } from '@/hooks/useFriends';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGoogleLoaded: boolean;
}

export function AddFriendDialog({ open, onOpenChange, isGoogleLoaded }: AddFriendDialogProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const addFriend = useAddFriend();

  const handlePlaceSelect = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location) return;

    try {
      await addFriend.mutateAsync({
        name: name.trim(),
        location,
      });
      toast.success(`${name} added to your friends!`);
      setName('');
      setLocation(null);
      onOpenChange(false);
    } catch {
      toast.error('Failed to add friend');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Friend</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="friend-name">Name</Label>
            <Input
              id="friend-name"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <AddressAutocomplete
              onPlaceSelect={handlePlaceSelect}
              isLoaded={isGoogleLoaded}
            />
            {location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-secondary rounded-md">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{location.address}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !location || addFriend.isPending}
            >
              {addFriend.isPending ? 'Adding...' : 'Add Friend'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
