// 不检查ts类型
// @ts-nocheck
import { compressDataWithStream } from "./compressDataWithStream";
import { assemblyData } from "./assemblyData";

(async () => {
  const timeout = 500;

  async function collectCoverageData(timing) {
    const { coverage, projectID, sha, instrumentCwd, dsn, reporter, compareTarget } = assemblyData(window.__coverage__);
    const fd = new FormData();
    const blob = await compressDataWithStream(JSON.stringify(coverage));

    fd.append('coverage', blob);
    fd.append('projectID', `tripgl-${projectID}-auto`);
    fd.append('sha', sha);
    fd.append('instrumentCwd', instrumentCwd);
    fd.append('compareTarget', compareTarget);
    fd.append('timing', timing);
    fd.append('reportID', 'fetchLater');

    const request = new Request(dsn, {
      method: 'POST',
      body: fd,
      headers: {
        'Authorization': `Bearer ${reporter}`,
      },
      keepalive: true, // 保持与 fetchLater 相同的行为
    });

    // 优先尝试 fetchLater，失败后降级到 fetch
    try {
      // @ts-ignore
      if (window.fetchLater) {
        console.log({ coverage: blob.size, projectID, sha }); // 只打印关键信息减少日志量
        // @ts-ignore
        await window.fetchLater(request, {
          priority: 'low',
          activationTimeout: 5000,
        });
      } else {
        await fallbackFetch(request);
      }
    } catch (error) {
      console.warn('fetchLater failed:', error);
      await fallbackFetch(request);
    }
  }

  // 降级方案：使用 fetch + keepalive
  async function fallbackFetch(request) {
    console.log('降级方案：使用 fetch + keepalive')
    try {
      // 如果浏览器支持 keepalive，优先使用
      const res = await fetch(request);
      if (!res.ok) {
        console.error('Fallback fetch failed:', res.status);
      }
    } catch (error) {
      console.error('All fetch methods failed:', error);
      // 极端情况可以存储到 IndexedDB 后续重试
    }
  }

  const timerHandler = () => {
    if (!window.__coverage__) {
      console.log('canyon: no coverage data');
      return;
    }

    // 优化：合并 visibilitychange 和 beforeunload 事件
    const sendData = () => collectCoverageData('pagehide');

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendData();
      }
    });

    // 添加 beforeunload 作为兜底
    window.addEventListener('beforeunload', sendData);
  };

  setTimeout(timerHandler, timeout);
})();
