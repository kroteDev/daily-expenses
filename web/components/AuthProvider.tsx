"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/domain/entities/User";
import {
  getAuthRepository,
  getTokenStore,
} from "@/infrastructure/api/client";
import {
  restoreSession,
  signInAndStore,
  signOutAndClear,
  signUpAndStore,
} from "@/usecases/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    passwordConfirmation: string,
    name: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const authRepository = getAuthRepository();
const tokenStore = getTokenStore();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    restoreSession(authRepository, tokenStore)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = await signInAndStore(authRepository, tokenStore, {
      email,
      password,
    });
    setUser(user);
    router.push("/dashboard");
  };

  const signUp = async (
    email: string,
    password: string,
    passwordConfirmation: string,
    name: string,
  ) => {
    const user = await signUpAndStore(authRepository, tokenStore, {
      email,
      password,
      passwordConfirmation,
      name,
    });
    setUser(user);
    router.push("/dashboard");
  };

  const signOut = async () => {
    await signOutAndClear(authRepository, tokenStore);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
