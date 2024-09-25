const libCoverage = require('istanbul-lib-coverage');


const generateHtml = ({coverage}) => {

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
      path: cur,
    })
    return acc;
  }, [])


  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Webpack App</title>
  <script>
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
