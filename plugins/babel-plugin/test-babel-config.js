module.exports = {
  plugins: [
    "istanbul",
    [
      "./dist",
      {
        repoID: "9050",
        sha: "xxxxx",
        provider: "gitlab",
        buildTarget: "",
        ci: true,
        keepMap: false,
        include: ["features/add.js"],
      },
    ],
  ],
};
