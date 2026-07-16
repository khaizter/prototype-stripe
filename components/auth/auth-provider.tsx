"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";

import { AuthModal } from "@/components/auth/auth-modal";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  displayName: string | null;
  openAuthModal: (mode?: "signin" | "signup") => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getDisplayName(user: User | null) {
  if (!user) return null;
  const metaName = user.user_metadata?.display_name;
  if (typeof metaName === "string" && metaName.trim()) return metaName.trim();
  return user.email ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const openAuthModal = useCallback((mode: "signin" | "signup" = "signin") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      loading,
      displayName: getDisplayName(user),
      openAuthModal,
      signOut,
    }),
    [user, loading, openAuthModal, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={authOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onOpenChange={setAuthOpen}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
