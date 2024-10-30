// 要收集的数据
// const dataToSend = JSON.stringify();
// window.__canyon__ = {}
// window.__coverage__ = {}
// 数据收集函数
// @ts-ignore
if (window.__canyon__ && window.__coverage__) {
  function collectData(t) {
    navigator.sendBeacon(
      "/api/coverage/collect",
      JSON.stringify({
        // @ts-ignore
        ...window.__canyon__,
        // @ts-ignore
        coverage: window.__coverage__,
        reportID: t,
      }),
    );
  }

  // beforeunload 事件：当用户即将离开页面时触发
  window.addEventListener("beforeunload", () => {
    collectData("beforeunload");
  });

  // unload 事件：在页面完全卸载前触发
  window.addEventListener("unload", () => {
    collectData("unload");
  });

  // visibilitychange 事件：当页面变为不可见（如切换到其他标签页）时触发
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      collectData("visibilitychange");
    }
  });
} else {
  console.log("no canyon no coverage");
}
