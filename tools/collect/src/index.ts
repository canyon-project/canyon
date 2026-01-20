(() => {
  const sendCoverage = () => {
    const dsn = window.CANYON_DSN;
    if (dsn && window.__coverage__) {
      fetch(dsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverage: window.__coverage__,
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
