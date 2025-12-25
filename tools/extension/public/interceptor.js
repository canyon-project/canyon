window.addEventListener('message', (e) => {
  if (e.data.type === '__canyon__event_get_coverage_and_canyon_data_request') {
    if (e.data.payload?.reportID !== undefined) {
      localStorage.setItem('__canyon__report__id__', e.data.payload.reportID);
    }
    const canyon =
      Object.keys(window.__coverage__ || {}).length > 0
        ? Object.values(window.__coverage__)[0]
        : {};
    // 删除不需要的属性
    const {
      b,
      f,
      s,
      path,
      statementMap,
      fnMap,
      branchMap,
      inputSourceMap,
      _coverageSchema,
      hash,
      contentHash,
      ...canyonWithoutUnused
    } = canyon;
    window.postMessage(
      {
        type: '__canyon__event_get_coverage_and_canyon_data_response',
        payload: {
          canyon: {
            ...canyonWithoutUnused,
            reportID:
              localStorage.getItem('__canyon__report__id__') || undefined,
          },
          coverage: window.__coverage__,
        },
      },
      '*',
    );
  }
});
