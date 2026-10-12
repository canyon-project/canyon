import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import routes from "~react-pages";

import AdminLayout from "./layouts/AdminLayout";

const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AdminLayout />,
    children: routes,
  },
];

function App() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-500">加载中...</div>}>
      {useRoutes(appRoutes)}
    </Suspense>
  );
}

export default App;
