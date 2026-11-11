import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";
import { ROUTES } from "@/constants/routes";

export interface AuthContextValue {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: AuthError | Error | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | Error | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  login: (email: string, name?: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  supabaseUser: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, needsEmailConfirmation: false }),
  signOut: async () => ({ error: null }),
  resetPasswordForEmail: async () => ({ error: null }),
  resendConfirmationEmail: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  login: () => {},
  logout: async () => {},
});

/**
 * Maps Supabase User to UserProfile without fabricated defaults.
 * Uses real metadata or undefined for uncalculated values.
 */
function mapSupabaseUserToProfile(supabaseUser: User | null): UserProfile | null {
  if (!supabaseUser) return null;
  const metadata = supabaseUser.user_metadata || {};
  const name =
    metadata.display_name ||
    metadata.full_name ||
    metadata.name ||
    supabaseUser.email?.split("@")[0] ||
    "Creator";
  const handle =
    metadata.handle ||
    `@${(supabaseUser.email?.split("@")[0] || "creator").toLowerCase()}`;

  return {
    id: supabaseUser.id,
    name,
    email: supabaseUser.email || "",
    handle,
    avatarUrl: metadata.avatar_url,
    dnaScore: typeof metadata.dna_score === "number" ? metadata.dna_score : undefined,
    plan: metadata.plan || "Free",
    niche: metadata.niche || undefined,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Synchronous Auth State Change Listener
  useEffect(() => {
    // Keep listener purely synchronous: update session and user state immediately
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setSupabaseUser(currentUser);
      setUser(mapSupabaseUserToProfile(currentUser));
      setIsLoading(false);
    });

    // Initial session fallback in case event hasn't fired yet
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        setIsLoading((loading) => {
          if (loading) {
            setSession(initialSession);
            const currentUser = initialSession?.user ?? null;
            setSupabaseUser(currentUser);
            setUser(mapSupabaseUserToProfile(currentUser));
            return false;
          }
          return false;
        });
      })
      .catch((err) => {
        console.warn("[Auth] getSession error:", err);
        setIsLoading(false);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Safe Profile Enrichment Outside the Auth Callback
  // Prevents race conditions and prevents stale profile queries from overwriting newer users
  useEffect(() => {
    const currentUserId = supabaseUser?.id;
    if (!currentUserId) {
      return;
    }

    let isCurrent = true;

    async function loadProfile() {
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUserId)
          .maybeSingle();

        if (!isCurrent) return; // Discard stale request if user changed or logged out

        if (profileData && !error) {
          setUser((prev) => {
            if (!prev || prev.id !== currentUserId) return prev;
            return {
              ...prev,
              name:
                profileData.display_name ||
                profileData.full_name ||
                profileData.name ||
                prev.name,
              handle: profileData.handle || prev.handle,
              avatarUrl: profileData.avatar_url || prev.avatarUrl,
              dnaScore:
                typeof profileData.dna_score === "number"
                  ? profileData.dna_score
                  : prev.dnaScore,
              plan: profileData.plan || prev.plan || "Free",
              niche: profileData.niche || prev.niche,
            };
          });
        }
      } catch (err: any) {
        // Non-blocking: baseProfile remains valid
        console.warn("[Auth] Profile database sync note:", err?.message || err);
      }
    }

    loadProfile();

    return () => {
      isCurrent = false; // Invalidate pending query on unmount or user change
    };
  }, [supabaseUser?.id]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error };
      }

      // onAuthStateChange handles session state update synchronously
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
          emailRedirectTo: `${window.location.origin}${ROUTES.VERIFY_EMAIL}`,
        },
      });

      if (error) {
        return { error, needsEmailConfirmation: false };
      }

      // Check if user already exists
      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        return {
          error: new Error(
            "An account with this email address already exists. Please sign in instead."
          ),
          needsEmailConfirmation: false,
        };
      }

      const needsEmailConfirmation = !data.session;
      return { error: null, needsEmailConfirmation };
    } catch (err: any) {
      return { error: err, needsEmailConfirmation: false };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}${ROUTES.VERIFY_EMAIL}`,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setSupabaseUser(null);
      return { error };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      setSupabaseUser(null);
      return { error: err };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
        }
      );
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${ROUTES.DASHBOARD}`,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const login = (email: string, name?: string) => {
    console.warn(
      "[Auth] `login()` is deprecated. Use `signIn(email, password)` for Supabase authentication."
    );
  };

  const logout = async () => {
    await signOut();
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: Boolean(user && session),
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        resendConfirmationEmail,
        updatePassword,
        signInWithGoogle,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;
