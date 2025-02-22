import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import BaseLayout from '@/layouts/BaseLayout';

export const Route = createRootRoute({
  component: () => (
    <>
      <BaseLayout>
        <Outlet />
      </BaseLayout>
      <TanStackRouterDevtools />
    </>
  ),
});
