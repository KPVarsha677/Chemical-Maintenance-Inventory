import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { FlaskConicalIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/** Gates the authenticated app (Dashboard, Inventory, etc.) behind a signed-in
 *  Supabase session. Unauthenticated visitors are sent to /login. */
export function ProtectedRoute({ children }: {children: React.ReactNode;}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2.5 text-sm text-slate-500">
          <FlaskConicalIcon className="h-4 w-4 animate-pulse text-brand-600" aria-hidden="true" />
          Checking your session…
        </div>
      </div>);

  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
