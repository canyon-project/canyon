// 页面的状态，例如主题、语言

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'



export const usePageStore = create(
  persist(
    (set, get) => ({
      projectCoverageRecordColumns: ['statements', 'newlines'],
      setProjectCoverageRecordColumns: (val) => set({ projectCoverageRecordColumns: val }),
    }),
    {
      name: 'page-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)
