import { mockCoverage } from './mockCoverage.ts';

export function getCoverageAndCanyonData(
  reportID: any,
  intervalTime: any,
  reporter: any,
): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (chrome?.tabs?.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          const message = {
            type: '__canyon__',
            payload: {
              reportID: reportID,
              intervalTime: intervalTime,
              reporter: reporter,
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
            commitSha: '8eedc8908c96ae994f4643a512ad723179a271a8',
            branch: 'main',
            dsn: 'http://canyon.com/coverage/client',
            reporter:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InR6aGFuZ20iLCJpZCI6ODQxNywiaWF0IjoxNzA0NzEzNTI3LCJleHAiOjIwMjAyODk1Mjd9.AStk7MMGAw4lx6tjwyUaZqRLabHVvRgkqO1iqpumWUk',
            instrumentCwd: '/builds/canyon/canyon-demo',
          },
          coverage: mockCoverage,
        });
      }
    }, 360);
  });
}

export function upload({ canyon, coverage }: any) {
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

export function downJson(content: string, filename: string) {
  const eleLink = document.createElement('a');
  eleLink.download = filename + '.json';
  eleLink.style.display = 'none';
  const blob = new Blob([content]);
  eleLink.href = URL.createObjectURL(blob);
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
}

function getCheckUserUrl(url: string) {
  try {
    return url.split('/coverage/client')[0] + '/api/user';
  } catch (e) {
    return url;
  }
}

export async function checkUser({ canyon }: any) {
  return fetch(getCheckUserUrl(canyon.dsn), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${canyon.reporter}`,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.statusCode > 300) {
        return JSON.stringify(res);
      } else {
        return res;
      }
    })
    .catch((err) => {
      return err;
    });
}
