'use client';

import { createRootRoute, Outlet } from '@tanstack/react-router';
// import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import BaseLayout from '@/layouts/BaseLayout';
import GlobalProvider from '@/providers/GlobalProvider.tsx';
import { ThemeProvider } from '@emotion/react';
import { theme } from 'antd';
import { useMemo } from 'react';
import useUserStore from "@/store/userStore.ts";

const { darkAlgorithm } = theme;

export const Route = createRootRoute({
  component: () => {
    const { token } = theme.useToken();

    const {userSettings} = useUserStore();

    // Create a separate dark theme token regardless of current mode
    const darkToken = useMemo(() => {

      if (userSettings.theme === 'light') {
        return theme.getDesignToken({
          algorithm: theme.defaultAlgorithm,
        });
      } else if (userSettings.theme === 'dark') {
        return theme.getDesignToken({
          algorithm: darkAlgorithm,
        });
      }
      return theme.getDesignToken({
        algorithm: theme.defaultAlgorithm,
      });

    }, [userSettings]);

    return (
      <GlobalProvider>
        <ThemeProvider theme={darkToken}>
          <BaseLayout>
            <Outlet />
          </BaseLayout>
        </ThemeProvider>

        {/*<TanStackRouterDevtools />*/}
      </GlobalProvider>
    );
  },
});
