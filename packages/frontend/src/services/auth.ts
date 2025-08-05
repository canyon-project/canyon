import api from '../utils/api';

export interface User {
  id: number;
  github_id: number;
  username: string;
  email: string;
  avatar_url: string;
  name: string;
  bio: string;
  location: string;
  company: string;
  blog: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  // 获取GitHub登录URL
  getGitHubLoginUrl: async (): Promise<{ url: string }> => {
    const response = await api.get('/auth/github');
    return response.data;
  },

  // GitHub OAuth回调处理
  handleGitHubCallback: async (code: string, state: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/github/callback', {
      code,
      state
    });
    return response.data;
  },

  // 获取当前用户信息
  getProfile: async (): Promise<User> => {
    const response = await api.get('/profile');
    return response.data;
  },

  // 登出
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  },

  // 检查是否已登录
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  // 获取存储的用户信息
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user_info');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 存储登录信息
  storeAuthData: (token: string, user: User) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_info', JSON.stringify(user));
  },
};