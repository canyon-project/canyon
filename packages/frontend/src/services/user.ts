import { request } from './request';

export type UserInfo = {
  username: string;
  nickname: string;
  email: string;
  avatar: string;
};

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return request.get<UserInfo | null>('/api/user').then((res) => {
    const data = res.data;
    if (data && typeof data === 'object' && 'username' in data) return data as UserInfo;
    return null;
  });
}
