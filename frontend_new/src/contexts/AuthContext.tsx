import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  /** Display name — the "full_name" set at sign-up, falling back to the email. */
  fullName: string;
  /** Two-letter initials for avatar badges, e.g. the sidebar/user chip. */
  initials: string;
}

type AuthResult = { ok: true } | { ok: false; error: string };
type SignUpResult =
{ ok: true;needsEmailConfirmation: boolean;} |
{ ok: false;error: string;};

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  authConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName?: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function initialsFor(fullName: string, email: string): string {
  const source = fullName.trim() || email;
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function toAuthUser(session: Session | null): AuthUser | null {
  const supaUser = session?.user;
  if (!supaUser) return null;
  const email = supaUser.email ?? '';
  const fullName = (supaUser.user_metadata?.full_name as string | undefined)?.trim() || email;
  return {
    id: supaUser.id,
    email,
    fullName,
    initials: initialsFor(fullName, email)
  };
}

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().
    then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    }).
    catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string): Promise<SignUpResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: fullName ? { data: { full_name: fullName } } : undefined
      });
      if (error) return { ok: false, error: error.message };
      // If email confirmation is required, Supabase returns a user but no session.
      return { ok: true, needsEmailConfirmation: !data.session };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const user = useMemo(() => toAuthUser(session), [session]);

  const value = useMemo(
    () => ({ user, session, loading, authConfigured: supabaseConfigured, signIn, signUp, signOut }),
    [user, session, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
