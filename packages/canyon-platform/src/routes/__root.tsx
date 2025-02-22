import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import BaseLayout from '@/layouts/BaseLayout';
// import { ConfigProvider } from 'antd';
import GlobalProvider from '@/providers/GlobalProvider.tsx';

export const Route = createRootRoute({
  component: () => (
    <GlobalProvider>
      <BaseLayout>
        <Outlet />
      </BaseLayout>
      <TanStackRouterDevtools />
    </GlobalProvider>
  ),
});
