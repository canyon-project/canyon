import { createContext, useContext } from "react";

export type AuthUser = {
  username: string;
  nickname: string;
  email: string;
  avatar: string;
};

export type AuthStatus = "loading" | "authenticated" | "guest";

export type AuthContentValue = {
  status: AuthStatus;
  user: AuthUser | null;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContent = createContext<AuthContentValue | null>(null);

type AuthContentProviderProps = {
  value: AuthContentValue;
  children: React.ReactNode;
};

export const AuthContentProvider = ({ value, children }: AuthContentProviderProps) => {
  return <AuthContent.Provider value={value}>{children}</AuthContent.Provider>;
};

export const useContent = () => {
  const context = useContext(AuthContent);
  if (!context) {
    throw new Error("useContent must be used within AuthContentProvider");
  }
  return context;
};
