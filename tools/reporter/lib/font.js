const fs = require('fs');
const path = require('path');

const generateFont = (targetDir) => {
  fs.cp(
    path.resolve(__dirname, './fonts/IBMPlexMono-Regular.woff2'),
    path.join(targetDir, './fonts/IBMPlexMono-Regular.woff2'),
    { recursive: true },
    (err) => {
      console.log(err);
    }
  );
};

module.exports = {
  generateFont,
};
