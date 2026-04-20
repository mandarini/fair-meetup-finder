import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';

export function LoginButton() {
  const { signInWithGoogle } = useAuth();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={signInWithGoogle}
      className="gap-2"
    >
      <LogIn className="h-4 w-4" />
      Sign in
    </Button>
  );
}
