if (window.__coverage__ && window.__canyon__analytics__dsn__) {
  function collectCoverageData(timing) {
    const data = {
      coverage: JSON.stringify(Object.entries(window.__coverage__).map(([path, {b,f,s}]) => ({
        path,
        b,
        f,
        s,
      })).reduce((acc, {path, b, f, s}) => {
        acc[path] = {b, f, s};
        return acc;
      })),
      canyonID:'canyon-platform-test1',
      addInfo:{
        // 时机
        timing: timing,
      }
    }
    navigator.sendBeacon(
      window.__canyon__analytics__dsn__,
      JSON.stringify(data),
    );
  }

// beforeunload 事件：当用户即将离开页面时触发
  window.addEventListener("beforeunload", () => {
    collectCoverageData("beforeunload");
  });

// unload 事件：在页面完全卸载前触发
  window.addEventListener("unload", () => {
    collectCoverageData("unload");
  });

// visibilitychange 事件：当页面变为不可见（如切换到其他标签页）时触发
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      collectCoverageData("visibilitychange");
    }
  });
}
