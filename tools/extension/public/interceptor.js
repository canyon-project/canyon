window.addEventListener('message', (e) => {
  if (e.data.type === '__canyon__event_get_coverage_and_canyon_data_request') {
    if (e.data.payload?.reportID !== undefined) {
      localStorage.setItem('__canyon__report__id__', e.data.payload.reportID);
    }
    const canyon =
      Object.keys(window.__coverage__ || {}).length > 0
        ? Object.values(window.__coverage__)[0]
        : {};
    console.log(canyon, 'canyon');
    window.postMessage(
      {
        type: '__canyon__event_get_coverage_and_canyon_data_response',
        payload: {
          canyon: {
            ...canyon,
            reportID:
              localStorage.getItem('__canyon__report__id__') || undefined,
            //   删除bfs等
            statementMap: undefined,
            fnMap: undefined,
            branchMap: undefined,
            inputSourceMap: undefined,
            _coverageSchema: undefined,
            hash: undefined,
            contentHash: 'undefined',
          },
          coverage: window.__coverage__,
        },
      },
      '*',
    );
  }
});
