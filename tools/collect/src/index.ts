(() => {
  const sendCoverage = () => {
    const coverageFirstValue = Object.values(window.__coverage__ || {})[0];
    const dsn = coverageFirstValue?.dsn || window.CANYON_DSN;
    if (dsn) {
      fetch(dsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverage: window.__coverage__,
          ...coverageFirstValue,
          scene: window.CANYON_SCENE || {},
        }),
      });
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendCoverage();
    }
  });
})();
