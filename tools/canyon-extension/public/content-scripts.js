const e = function () {
  const t = document.createElement('script');
  (t.type = 'text/javascript'),
    (t.className = 'content_scripts'),
    // eslint-disable-next-line no-undef
    (t.src = chrome.runtime.getURL('interceptor.js')),
    (document.head || document.documentElement).appendChild(t);
};
e();

let casualCoverageAndCanyonData = null;

window.addEventListener('message', function (e) {
  if (e.data.type === '__canyon__event_get_coverage_and_canyon_data_response') {
    casualCoverageAndCanyonData = e.data.payload;
  }
});

function getCoverageAndCanyonData(reportID, intervalTime, reporter) {
  window.postMessage(
    {
      type: '__canyon__event_get_coverage_and_canyon_data_request',
      payload: {
        reportID,
        intervalTime,
        reporter,
      },
    },
    '*',
  );
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(casualCoverageAndCanyonData);
    }, 360);
  });
}

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === '__canyon__') {
    getCoverageAndCanyonData(
      request?.payload?.reportID,
      request?.payload?.intervalTime,
      request?.payload?.reporter,
    ).then((res) => {
      casualCoverageAndCanyonData = null;
      sendResponse(res);
    });
    return true;
  }
});
