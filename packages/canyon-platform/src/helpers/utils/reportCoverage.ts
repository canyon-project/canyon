export function reportCoverage() {
  try {
    // @ts-ignore
    const canyon = Object.values(window.__coverage__)[0] as any;
    return fetch(canyon.dsn, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "POST",
      body: JSON.stringify({
        ...canyon,
        // @ts-ignore
        coverage: window.__coverage__,
        reportID: localStorage.getItem("username") || undefined,
      }),
    });
  } catch (e) {
    console.log(e);
    return Promise.resolve();
  }
}
