import './assets/index.css';
// 使用动态导入替代直接导入，减少初始加载时间
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 预加载 Monaco 编辑器
const preloadMonaco = async () => {
  try {
    const monaco = await import('https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/+esm');
    window.monaco = monaco;
    return monaco;
  } catch (error) {
    console.error('Failed to load Monaco editor:', error);
    return null;
  }
};

// 使用 requestIdleCallback 在浏览器空闲时预加载 Monaco
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    preloadMonaco();
  });
} else {
  // 降级处理
  setTimeout(() => {
    preloadMonaco();
  }, 1000);
}

// 使用 Performance API 测量渲染时间
performance.mark('render-start');

createRoot(document.getElementById('root')!).render(<App />);

// 测量渲染完成时间
performance.mark('render-end');
performance.measure('app-render', 'render-start', 'render-end');

// 输出渲染性能指标
if (process.env.NODE_ENV !== 'production') {
  const measure = performance.getEntriesByName('app-render')[0];
  console.log(`App rendered in ${measure.duration.toFixed(2)}ms`);
}
