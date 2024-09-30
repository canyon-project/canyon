const libCoverage = require('istanbul-lib-coverage');
const getCommonPathPrefix = (paths) => {
  if (paths.length === 0) return '';
  const splitPaths = paths.map(path => path.split('/'));
  const minLength = Math.min(...splitPaths.map(p => p.length));

  let commonPrefix = [];
  for (let i = 0; i < minLength; i++) {
    const segment = splitPaths[0][i];
    if (splitPaths.every(path => path[i] === segment)) {
      commonPrefix.push(segment);
    } else {
      break;
    }
  }
  return commonPrefix.join('/');
};
const generateHtml = ({coverage,reportName,_instrumentCwd}) => {
  const commonPath = getCommonPathPrefix(Object.keys(JSON.parse(coverage)));
  const instrumentCwd = _instrumentCwd || commonPath;
  var map = libCoverage.createCoverageMap(JSON.parse(coverage));
  const obj = {}
  map.files().forEach(function(f) {
    var fc = map.fileCoverageFor(f),
      s = fc.toSummary();
    obj[f] = s.toJSON();
  });

  const su = Object.keys(obj).reduce((acc, cur) => {
    acc.push({
      ...obj[cur],
      path: cur.replaceAll(instrumentCwd+'/', ""),
    })
    return acc;
  }, [])


  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Webpack App</title>
  <script>
  window.reportName="${reportName}"
    window.data = ${JSON.stringify(su)};
  </script>
  <script defer="defer" src="asset/main.js"></script>
</head>
<body>
<div id="root"></div>
</body>
</html>
`
}

module.exports = {
  generateHtml
}
