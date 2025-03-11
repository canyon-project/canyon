import { create } from 'zustand';

// 定义用户设置的类型
interface UserSettings {
  theme: string;
  language: string;
  defaultDimension: string;
}

// 定义用户信息的类型
interface User {
  id: string;
  email: string;
  username: string;
  nickname: string;
  avatar: string;
}

const defaultUserSettings: UserSettings = {
  theme: 'dark',
  language: 'cn',
  defaultDimension: '2d',
};

// 创建一个用户信息和设置的状态管理 store
const useUserStore = create<{
  user: User | null;
  userSettings: UserSettings; // 修改为非 null 类型，因为有默认值
  setUser: (user: User) => void;
  clearUser: () => void;
  setUserSettings: (partialSettings: Partial<UserSettings>) => void;
  clearUserSettings: () => void;
}>((set) => ({
  user: null, // 用户信息初始值为空
  userSettings: defaultUserSettings, // 用户设置初始值为默认设置
  setUser: (user) => set({ user }), // 更新用户信息
  clearUser: () => set({ user: null }), // 清除用户信息
  setUserSettings: (partialSettings) => set((state) => {
    const newUserSettings: UserSettings = {
      ...state.userSettings,
      ...partialSettings
    } as UserSettings; // 类型断言确保 newUserSettings 符合 UserSettings 类型
    return { userSettings: newUserSettings };
  }), // 仅修改传入的 key
  clearUserSettings: () => set({ userSettings: defaultUserSettings }), // 清除用户设置，恢复默认值
}));

export default useUserStore;
