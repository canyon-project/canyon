import fs from "node:fs";
import path from "node:path";
import * as process from "node:process";
import axios from "axios";
export async function mapCommand(params, options) {
  const { dsn, project_id:projectID, commit_sha:sha } = params;
  console.log(dsn, projectID, sha);
  const files = fs.readdirSync(path.resolve(process.cwd(), ".canyon_output"));
  let data = {};
  for (let i = 0; i < files.length; i++) {
    const fileCoverageString = fs.readFileSync(
      path.resolve(process.cwd(), ".canyon_output", files[i]),
      "utf-8",
    );
    data = {
      ...data,
      ...JSON.parse(fileCoverageString),
    };
  }
  await axios.post(dsn, {
    projectID: projectID||process.env.CI_COMMIT_SHA,
    sha: sha||process.env.CI_PROJECT_ID,
    instrumentCwd: process.cwd(),
    coverage: JSON.stringify(data),
  });
}
