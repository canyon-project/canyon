const libCoverage = require('istanbul-lib-coverage');
const path = require('path');
const fs = require('node:fs');
const { getCommonPathPrefix } = require('./utils');
const { sourceMapFixer } = require('canyon-library-istanbul-coverage');

const generateHtml = ({ coverage, reportName, instrumentCwd, date }) => {
  const commonPath = getCommonPathPrefix(Object.keys(JSON.parse(coverage)));
  instrumentCwd = instrumentCwd || commonPath;

  // const newCoverage = sourceMapFixer(JSON.parse(coverage),instrumentCwd)
  const newCoverage = JSON.parse(coverage);
  const map = libCoverage.createCoverageMap(newCoverage);
  const obj = {};
  map.files().forEach((f) => {
    const fc = map.fileCoverageFor(f);
    const s = fc.toSummary();
    obj[f] = s.toJSON();
  });

  const su = Object.keys(obj).reduce((acc, cur) => {
    acc.push({
      ...obj[cur],
      path: cur.replaceAll(`${instrumentCwd}/`, ''),
    });
    return acc;
  }, []);

  const sourceDirssss = path.resolve(__dirname, './test2.html');

  const content = fs.readFileSync(sourceDirssss, 'utf8');

  const temp = `
  window.reportName="${reportName}";
  window.data = ${JSON.stringify(su)};
  window.date = "${date}";
  `;

  return content.replaceAll('// needMock', temp);
};

module.exports = {
  generateHtml,
};
