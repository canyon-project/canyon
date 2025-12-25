import { declare } from '@babel/helper-plugin-utils';
import { visitorProgramExit } from './visitor-program-exit';
export default declare((api, config) => {
  api.assertVersion(7);
  return {
    visitor: {
      Program: {
        exit: (path) => {
          const servePa = config;

          visitorProgramExit(api, path, servePa, config);
        },
      },
    },
  };
});
