const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
  api.assertVersion(7);

  return {
    name: '@canyonjs/babel-plugin',

    visitor: {
      Program: {
        enter(path, state) {
          console.log('3.0.0');
          // Plugin logic will be implemented here
        },
      },
    },
  };
});
