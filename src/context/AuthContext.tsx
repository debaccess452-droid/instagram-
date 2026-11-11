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
  updatePassword: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  login: () => {},
  logout: async () => {},
});

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
    dnaScore: metadata.dna_score ?? 92,
    plan: metadata.plan ?? "Creator Pro",
    niche: metadata.niche ?? "Tech & Creator Economy",
  };
}

async function fetchUserProfile(supabaseUser: User): Promise<UserProfile> {
  const baseProfile = mapSupabaseUserToProfile(supabaseUser)!;
  try {
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    if (profileData && !error) {
      return {
        ...baseProfile,
        name:
          profileData.display_name ||
          profileData.full_name ||
          profileData.name ||
          baseProfile.name,
        handle: profileData.handle || baseProfile.handle,
        avatarUrl: profileData.avatar_url || baseProfile.avatarUrl,
        dnaScore: profileData.dna_score ?? baseProfile.dnaScore,
        plan: profileData.plan ?? baseProfile.plan,
        niche: profileData.niche ?? baseProfile.niche,
      };
    }
  } catch {
    // If profiles query fails due to RLS or missing table, use baseProfile
  }
  return baseProfile;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial Session Check
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn("[Auth] Initial session error:", error.message);
        }

        if (initialSession?.user) {
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          const profile = await fetchUserProfile(initialSession.user);
          if (isMounted) {
            setUser(profile);
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setSession(null);
            setSupabaseUser(null);
            setUser(null);
            setIsLoading(false);
          }
        }
      })
      .catch((err) => {
        console.error("[Auth] Failed to initialize session:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // 2. Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      setSession(currentSession);
      setSupabaseUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const profile = await fetchUserProfile(currentSession.user);
        if (isMounted) {
          setUser(profile);
          setIsLoading(false);
        }
      } else {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error };
      }

      if (data.session?.user) {
        setSession(data.session);
        setSupabaseUser(data.session.user);
        const profile = await fetchUserProfile(data.session.user);
        setUser(profile);
      }

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
          emailRedirectTo: `${window.location.origin}${ROUTES.LOGIN}`,
        },
      });

      if (error) {
        return { error, needsEmailConfirmation: false };
      }

      // Check if user already exists in Supabase (identities array is empty in some Supabase setups)
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

      // When email confirmation is enabled, session is null
      const needsEmailConfirmation = !data.session;

      if (data.session?.user) {
        setSession(data.session);
        setSupabaseUser(data.session.user);
        const profile = await fetchUserProfile(data.session.user);
        setUser(profile);
      }

      return { error: null, needsEmailConfirmation };
    } catch (err: any) {
      return { error: err, needsEmailConfirmation: false };
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

  // Compatibility helper
  const login = (email: string, name?: string) => {
    console.warn(
      "[Auth] `login()` called directly. Prefer `signIn(email, password)` for real Supabase authentication."
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
