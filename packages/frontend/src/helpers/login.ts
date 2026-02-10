import { useSearchParams } from 'react-router-dom';

// ============ 默认：游客模式（无真实鉴权，自动脚本会替换此文件实现真实逻辑）============

export const AUTH_TOKEN_COOKIE_NAME = 'auth_token';
export const AUTH_TOKEN_MAX_AGE_DAYS = 7;

const GUEST_TOKEN = 'guest';

function readTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(^| )' + AUTH_TOKEN_COOKIE_NAME + '=([^;]+)')
  );
  return match ? decodeURIComponent(match[2]) : null;
}

export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const token = readTokenFromCookie();
  if (!token) {
    setToken(GUEST_TOKEN);
    return GUEST_TOKEN;
  }
  return token;
}

export function setToken(token: string, options?: { maxAgeDays?: number }): void {
  if (typeof document === 'undefined') return;
  const days = options?.maxAgeDays ?? AUTH_TOKEN_MAX_AGE_DAYS;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearToken(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=; path=/; max-age=0`;
}

// 每次进入（模块加载 / 页面加载）时检测，无 cookie 则写入游客
if (typeof document !== 'undefined' && !readTokenFromCookie()) {
  setToken(GUEST_TOKEN);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getLoginUrl(_returnUrl?: string): string {
  return typeof window !== 'undefined' ? window.location.href : '#';
}

export interface ValidateTicketResult {
  token: string;
  user?: { name?: string; email?: string };
}

export async function validateTicket(_ticket: string): Promise<ValidateTicketResult | null> {
  return { token: GUEST_TOKEN, user: { name: GUEST_TOKEN } };
}

export type AuthGateStatus = 'authenticated' | 'validating' | 'guest';

export function useAuthGate(): {
  status: AuthGateStatus;
  goLogin: () => void;
} {
  useSearchParams();
  return {
    status: 'authenticated',
    goLogin: () => {},
  };
}
