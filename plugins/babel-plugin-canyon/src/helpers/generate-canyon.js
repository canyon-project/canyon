import fs from 'fs';
import path from 'path'


function convertKeysToCamelCase(obj) {
    return {
        projectID: obj.PROJECT_ID,
        buildID: obj.BUILD_ID,
        dsn: obj.DSN,
        instrumentCwd: obj.INSTRUMENT_CWD,
        reporter: obj.REPORTER,
        commitSha: obj.COMMIT_SHA,
        sha: obj.COMMIT_SHA,
        reportID: obj.REPORT_ID,
        compareTarget: obj.COMPARE_TARGET,
        branch: obj.BRANCH,
        version: obj.VERSION
    }
}

export const generateCanyon = (canyon) => {
    const filePath = './.canyon_output/canyon.json';
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
    // 如果不存在则创建
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(convertKeysToCamelCase(canyon), null, 2), 'utf-8');
    }
}
