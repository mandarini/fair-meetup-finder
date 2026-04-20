import { useAuth } from '@/hooks/useAuth';
import { LoginButton } from '@/components/auth/LoginButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AppHeader() {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-20">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="p-1 rounded-lg bg-accent/10">
          <MapPin className="h-4 w-4 text-accent" />
        </div>
        <span className="font-display text-sm font-bold text-foreground">MeetPoint</span>
      </button>

      <div className="flex items-center gap-2">
        {!isLoading && (isLoggedIn ? <UserMenu /> : <LoginButton />)}
      </div>
    </header>
  );
}
