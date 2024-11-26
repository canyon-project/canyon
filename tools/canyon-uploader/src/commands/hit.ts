import fs from "node:fs";
import path from "node:path";
import axios from "axios";

export async function hitCommand(params, options) {
	const { dsn } = params;
	// 判断是否存在.canyon_output文件夹
	if (!fs.existsSync(path.resolve(process.cwd(), ".canyon_output"))) {
		console.error("No coverage data found in .canyon_output");
		return;
	}

	const files = fs
		.readdirSync(path.resolve(process.cwd(), ".canyon_output"))
		.filter((file) => file.includes("hit"));
	if (files.length === 0) {
		console.error("No coverage data found in .canyon_output");
		return;
	}

	//   files中的覆盖率数据是整体的，而且可能来自不同项目，所以需要分别上传
	//

	const map = {};

	for (let i = 0; i < files.length; i++) {
		const fileCoverageString = fs.readFileSync(
			path.resolve(process.cwd(), ".canyon_output", files[i]),
			"utf-8",
		);
		const data = JSON.parse(fileCoverageString);

		if (Object.values(data).length > 0) {
			const { sha, projectID, reportID, instrumentCwd } =
				data[Object.keys(data)[0]];
			if (!map[JSON.stringify({ sha, projectID, reportID, instrumentCwd })]) {
				map[JSON.stringify({ sha, projectID, reportID, instrumentCwd })] = [];
			}
			map[JSON.stringify({ sha, projectID, reportID, instrumentCwd })].push(
				data,
			);
		}
	}
	// console.log(map);
	return Promise.all(
		Object.entries(map).map(([key, value]) => {
			const { sha, projectID, instrumentCwd, reportID } = JSON.parse(key);
			console.log(sha, projectID, instrumentCwd, reportID);
			return axios.post(dsn, {
				sha: sha,
				projectID: projectID,
				instrumentCwd: instrumentCwd,
				// branch: "-",
        coverage: value[0],
				reportID: reportID,
			});
		}),
	);
}
