// const __canyon__ = ((window.__canyon__||(Object.keys(window.__coverage__||{}).length>0 ? Object.values(window.__coverage__)[0] : undefined))||(Object.keys(window.__coverage__||{}).length>0 ? Object.values(window.__coverage__)[0] : undefined));
window.addEventListener('message', (e) => {
  if (e.data.type === '__canyon__event_get_coverage_and_canyon_data_request') {
    // 新增逻辑，获取覆盖率数据的时候还可以set reportID，key定为__canyon__report__id__
    if (e.data.payload?.reportID !== undefined) {
      localStorage.setItem('__canyon__report__id__', e.data.payload.reportID);
    }
    if (e.data.payload?.intervalTime !== undefined) {
      localStorage.setItem('__canyon__interval__time__', e.data.payload.intervalTime);
    }
    if (e.data.payload?.reporter !== undefined) {
      localStorage.setItem('__canyon__reporter__', e.data.payload.reporter);
    }
    window.postMessage(
      {
        type: '__canyon__event_get_coverage_and_canyon_data_response',
        payload: {
          canyon: {
            ...(window.__canyon__ ||
              (Object.keys(window.__coverage__ || {}).length > 0
                ? Object.values(window.__coverage__)[0]
                : undefined)),
            reportID: localStorage.getItem('__canyon__report__id__') || undefined,
            intervalTime:
              localStorage.getItem('__canyon__interval__time__') ||
              (
                window.__canyon__ ||
                (Object.keys(window.__coverage__ || {}).length > 0
                  ? Object.values(window.__coverage__)[0]
                  : undefined)
              )?.intervalTime,
            reporter:
              localStorage.getItem('__canyon__reporter__') ||
              (
                window.__canyon__ ||
                (Object.keys(window.__coverage__ || {}).length > 0
                  ? Object.values(window.__coverage__)[0]
                  : undefined)
              )?.reporter,
          },
          coverage: window.__coverage__,
        },
      },
      '*'
    );
  }
});

// 1s后再去获取尝试间隔上报
setTimeout(() => {
  // 先尝试本地获取，如果没有再去获取window上的数据（注意 0 需要被正确识别为关闭间隔上报）
  const localInterval = localStorage.getItem('__canyon__interval__time__');
  const __canyon__interval__time__ =
    localInterval !== null ? Number(localInterval) : Number(window?.__canyon__?.intervalTime);
  // (window.__canyon__||(Object.keys(window.__coverage__||{}).length>0 ? Object.values(window.__coverage__)[0] : undefined)) && window.__coverage__)
  const islegal =
    (window.__canyon__ ||
      (Object.keys(window.__coverage__ || {}).length > 0
        ? Object.values(window.__coverage__)[0]
        : undefined)) &&
    window.__coverage__;
  if (islegal) {
    // 约束区间 [0, 60]，0 表示关闭
    const numRaw = Number(__canyon__interval__time__);
    const num = Number.isFinite(numRaw) ? Math.max(0, Math.min(60, numRaw)) : 0;
    if (num > 0) {
      setInterval(() => {
        if (
          (window.__canyon__ ||
            (Object.keys(window.__coverage__ || {}).length > 0
              ? Object.values(window.__coverage__)[0]
              : undefined)) &&
          window.__coverage__
        ) {
          fetch(
            (
              window.__canyon__ ||
              (Object.keys(window.__coverage__ || {}).length > 0
                ? Object.values(window.__coverage__)[0]
                : undefined)
            ).dsn,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${(window.__canyon__ || (Object.keys(window.__coverage__ || {}).length > 0 ? Object.values(window.__coverage__)[0] : undefined)).reporter}`,
              },
              body: JSON.stringify({
                coverage: window.__coverage__,
                ...(window.__canyon__ ||
                  (Object.keys(window.__coverage__ || {}).length > 0
                    ? Object.values(window.__coverage__)[0]
                    : undefined)),
                reportID: localStorage.getItem('__canyon__report__id__') || undefined,
              }),
            }
          ).then(() => {
            console.log('report coverage success');
          });
        } else {
          console.log('coverage or canyon data is not ready');
        }
      }, num * 1000);
    }
  }
}, 1000);
