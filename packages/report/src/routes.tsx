import { Spin } from 'antd';
import { Suspense, lazy } from 'react';

// 使用懒加载导入组件
const Report = lazy(() => import('./components/Report'));

// 加载中的占位组件
const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size='large' tip='Loading...' />
  </div>
);

// 路由配置
export const routes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <Report />
      </Suspense>
    ),
  },
];

// 懒加载包装器
export const lazyLoad = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<LoadingComponent />}>
    <Component />
  </Suspense>
);
