const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
  api.assertVersion(7);

  return {
    name: '@canyonjs/plugin-babel',

    visitor: {
      Program: {
        enter(path, state) {
          console.log('123')
          // Plugin logic will be implemented here
        }
      }
    }
  };
});
