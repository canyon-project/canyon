import { mockCoverage } from './mockCoverage.ts';

export function getCoverageAndCanyonData(reportID: any): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (chrome?.tabs?.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          const message = {
            type: '__canyon__',
            payload: {
              reportID: reportID,
            },
          };
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, message, (res) => {
              if (res.coverage === undefined) {
                reject('No coverage data detected.');
              }
              if (res.canyon === undefined) {
                reject('No canyon data detected.');
              }
              resolve(res);
              return true;
            });
          }
        });
      } else {
        resolve({
          canyon: {
            projectID: '86927',
            sha: '8eedc8908c96ae994f4643a512ad723179a271a8',
            branch: 'main',
            dsn: 'http://canyon.com/coverage/client',
            instrumentCwd: '/builds/canyon/canyon-demo',
          },
          coverage: mockCoverage,
        });
      }
    }, 360);
  });
}

export function upload({ canyon, coverage }: any) {
  console.log(canyon, coverage);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fetch(canyon.dsn, {
        method: 'POST',
        body: JSON.stringify({
          ...canyon,
          coverage,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${canyon.reporter}`,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.statusCode > 300) {
            reject(JSON.stringify(res));
          } else {
            resolve(res);
          }
        })
        .catch((err) => {
          reject(String(err));
        });
    }, 500);
  });
}
