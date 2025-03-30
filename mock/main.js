import coverage from './coverage.json' assert { type: 'json' };
import axios from "axios";
const testProviders = [{
    name: 'mpaas',
}, {
    name: 'flytest',
}];

const buildProviders = [{
    name: 'gitlab_ci',
}, {
    name: 'mpaas_ci',
}];

const data = {
    "projectID": "gitlab-130830",
    "branch": "dev",
    "instrumentCwd": "/Users/zhangtao25/draft/webpack-babel-ts",
    "coverage": {}
};

function generateRandomString(length) {
    const characters = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateRandomProjectID() {
    return `gitlab-${Math.floor(Math.random() * 1000000)}`;
}

function generateRandomBranch() {
    const branchTypes = ['feature', 'bugfix', 'release', 'hotfix', 'dev'];
    const randomType = branchTypes[Math.floor(Math.random() * branchTypes.length)];
    if (randomType === 'dev') return 'dev';
    const randomFeature = generateRandomString(8);
    return `${randomType}/${randomFeature}`;
}

// 生成10个不同的项目
const projects = Array.from({ length: 10 }, () => generateRandomProjectID());

// 对每个项目生成20个commit
projects.forEach(projectID => {
    // 生成20个不同的commit
    for (let i = 0; i < 20; i++) {
        const randomSha = generateRandomString(40);
        const randomBranch = generateRandomBranch();
        const compareTarget = randomBranch === 'dev' ? 'master' : 'dev';

        Object.entries(buildProviders).forEach(([, buildValue]) => {
            Object.entries(testProviders).forEach(([, testValue]) => {
                const body = {
                    ...data,
                    buildProvider: buildValue.name,
                    buildID: '666',
                    reportProvider: testValue.name,
                    reportID: '999',
                    sha: randomSha,
                    projectID: projectID,
                    coverage: coverage,
                    branch: randomBranch,
                    compareTarget: compareTarget
                }

                axios.post(`http://localhost:8080/coverage/client`, body).then(r => {
                    console.log(r.data)
                })
            });
        });
    }

})
