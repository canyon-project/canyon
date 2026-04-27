import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import {
  AuthContentProvider,
  type AuthStatus,
  type AuthUser,
} from "@/contexts/AuthContent";
import { authClient } from "@/lib/auth-client";

type AppAuthGuardProps = {
  children: ReactNode;
};

const AppAuthGuard = ({ children }: AppAuthGuardProps) => {
  const location = useLocation();
  const sessionState = authClient.useSession();
  const session = sessionState.data;
  const hasRedirectedRef = useRef(false);

  const status: AuthStatus = sessionState.isPending
    ? "loading"
    : session?.user
      ? "authenticated"
      : "guest";

  const user = useMemo(() => {
    const sessionUser = session?.user as
      | {
          username?: string;
          name?: string;
          email?: string;
          image?: string;
        }
      | undefined;

    if (!sessionUser) {
      return null;
    }

    return {
      username: sessionUser.username || sessionUser.email || "unknown",
      nickname: sessionUser.name || sessionUser.username || sessionUser.email || "Unknown User",
      email: sessionUser.email || "",
      avatar: sessionUser.image || "",
    } satisfies AuthUser;
  }, [session]);

  useEffect(() => {
    if (status !== "authenticated" || !user) {
      return;
    }
    localStorage.setItem(
      "canyon_user_info",
      JSON.stringify({
        username: user.username,
        nickname: user.nickname,
        email: user.email,
      }),
    );
  }, [status, user]);

  useEffect(() => {
    if (status !== "guest" || hasRedirectedRef.current) {
      return;
    }
    hasRedirectedRef.current = true;
    localStorage.removeItem("canyon_user_info");
    const redirect = `${location.pathname}${location.search}${location.hash}` || "/";
    const loginUrl = new URL("/login.html", window.location.origin);
    loginUrl.searchParams.set("redirect", redirect);
    window.location.replace(loginUrl.toString());
  }, [location.hash, location.pathname, location.search, status]);

  const value = {
    status,
    user,
    refreshSession: async () => {
      await authClient.getSession();
    },
    logout: async () => {
      await authClient.signOut();
      localStorage.removeItem("canyon_user_info");
      window.location.replace("/login.html");
    },
  };

  if (status === "loading") {
    return <div>加载中...</div>;
  }

  if (status === "guest") {
    return <div>正在跳转登录...</div>;
  }

  return <AuthContentProvider value={value}>{children}</AuthContentProvider>;
};

export default AppAuthGuard;
