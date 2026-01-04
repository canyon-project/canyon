(() => {
  const sendCoverage = () => {
    const coverageFirstValue = Object.values(window.__coverage__ || {})[0];
    if (coverageFirstValue) {
      fetch(coverageFirstValue.dsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverage: window.__coverage__,
          ...coverageFirstValue,
        }),
      });
    }
  };

  // document.addEventListener('visibilitychange', () => {
  //   if (document.visibilityState === 'hidden') {
  //     sendCoverage();
  //   }
  // });
})();
