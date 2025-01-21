import fs from "node:fs";
import path from "node:path";

import axios from "axios";
export async function mapCommand(params, options) {
	let {
		dsn,
		project_id: projectID,
		sha,
		instrument_cwd: instrumentCwd,
    branch,
    provider,
		workspace,
    target_folder_name:targetFolderName
	} = params;
  targetFolderName = targetFolderName || '.canyon_output'
	const realWorkspace = workspace || process.cwd();
	// 判断是否存在.canyon_output文件夹
	if (!fs.existsSync(path.resolve(realWorkspace, targetFolderName))) {
		console.error(`No coverage data found in ${targetFolderName}`);
		return;
	}

	const files = fs.readdirSync(path.resolve(realWorkspace, targetFolderName)).filter((file) => /^coverage-.*\.json$/.test(file));
	if (files.length === 0) {
    console.error(`No coverage data found in ${targetFolderName}`);
		return;
	}
	let data = {};
	for (let i = 0; i < files.length; i++) {
		const fileCoverageString = fs.readFileSync(
			path.resolve(realWorkspace, targetFolderName, files[i]),
			"utf-8",
		);
		data = {
			...data,
			...JSON.parse(fileCoverageString),
		};
	}
	const reqData = {
		projectID:
			projectID || process.env.CI_PROJECT_ID || process.env.GITHUB_REPOSITORY_ID,
		sha: sha || process.env.CI_COMMIT_SHA || process.env.GITHUB_SHA,
    branch: branch || process.env.CI_COMMIT_BRANCH || process.env.GITHUB_REF,
		instrumentCwd: instrumentCwd || process.cwd(),
		coverage: Object.keys(data),
    provider: provider,
	};
	console.log(reqData);
	await axios
		.post(dsn, {
      ...reqData,
			coverage: data,
      projectID:`${reqData.provider}-${reqData.projectID}-auto`,
		})
		.catch((e) => {
			// 打印错误
			console.log(e.message, e.name, e.errors, e.response);
			return e;
		});
}
