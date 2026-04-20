import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase JS client automatically detects the session from the URL hash
    // on implicit flow. Just redirect home after a brief moment.
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-muted-foreground">Signing you in...</div>
    </div>
  );
}
