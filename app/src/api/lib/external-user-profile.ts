export type ExternalUserProfile = {
  nickname: string;
  avatar: string;
  email: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeUsernameByEmail(email: string): string {
  const normalized = normalizeEmail(email);
  if (!normalized) return "";
  return normalized.split("@")[0] || normalized;
}

// 默认实现：不依赖外部服务，不生成头像
export function getAvatarUrlByEmployee(_: string): string {
  return "";
}

// 默认实现：基于邮箱本地生成用户信息
export async function fetchExternalUserProfileByEmail(
  email: string,
): Promise<ExternalUserProfile | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const username = normalizeUsernameByEmail(normalized);
  return {
    nickname: username || normalized,
    avatar: "",
    email: normalized,
  };
}

export async function fetchExternalUserProfilesByEmails(
  emails: string[],
): Promise<Map<string, ExternalUserProfile>> {
  const normalizedEmails = Array.from(
    new Set(emails.map((email) => normalizeEmail(email)).filter((email) => email.length > 0)),
  );

  const result = new Map<string, ExternalUserProfile>();
  for (const email of normalizedEmails) {
    const profile = await fetchExternalUserProfileByEmail(email);
    if (profile) result.set(email, profile);
  }

  return result;
}
