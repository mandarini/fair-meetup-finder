import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for the auth client to process the URL hash and persist the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/', { replace: true });
        }
      }
    );

    // Fallback: redirect home after 5s even if something goes wrong
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-muted-foreground">Signing you in...</div>
    </div>
  );
}
