module.exports = {
  plugins: [
    "istanbul",
    [
      "@canyonjs",
      {
        keepMap: true,
        ci: true,
        provider: process.env.CANYON_PROVIDER || (process.env.GITHUB_ACTIONS ? "github" : "github"),
        repoID: process.env.GITHUB_REPOSITORY || process.env.CI_PROJECT_ID || "todolist",
        sha: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || "",
        instrumentCwd: process.cwd(),
      },
    ],
  ],
};
