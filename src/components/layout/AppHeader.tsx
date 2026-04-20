import { useAuth } from '@/hooks/useAuth';
import { LoginButton } from '@/components/auth/LoginButton';
import { UserMenu } from '@/components/auth/UserMenu';
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
        <img src="/fairmeet.png" alt="FairMeet" className="h-7 w-7" />
        <span className="font-display text-sm font-bold text-foreground">FairMeet</span>
      </button>

      <div className="flex items-center gap-2">
        {!isLoading && (isLoggedIn ? <UserMenu /> : <LoginButton />)}
      </div>
    </header>
  );
}
