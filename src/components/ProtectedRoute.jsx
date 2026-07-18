import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-600">
        Memeriksa sesi admin...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}
