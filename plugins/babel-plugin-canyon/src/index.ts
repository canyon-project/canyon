// import generate from "@babel/generator";
import { declare } from "@babel/helper-plugin-utils";
// import packageJson from "../package.json";
import {visitorProgramExit} from "./visitor-program-exit";
// import providers from './ci_providers'
import {detectProvider} from "./helpers/provider";

//TODO 得考虑，是否要加map post到服务器，降低接入成本。对应的map接口需要可以更新

export default declare((api, config) => {
	api.assertVersion(7);
	return {
		visitor: {
			Program: {
        exit: (path) => {
          // 侦测流水线
          // 优先级：手动设置 > CI/CD提供商
          // hit需要打到__coverage__中，因为ui自动化测试工具部署地方不确定
          // map就不需要，写到本地时，可以侦测本地流水线变量，直接上报上来
          // 他的职责只是寻找到项目，和插桩路径
          const serviceParams = detectProvider({
            envs: process.env,
            // @ts-ignore
            args: {
              projectID: config.projectID,
              sha: config.sha,
              // instrumentCwd: config.instrumentCwd,
              branch: config.branch,
            }
          })
          // console.log(serviceParams,'serviceParams')
          visitorProgramExit(api,path,{
            projectID: config.projectID || serviceParams.slug||'-',
            sha: config.sha||serviceParams.commit||'-',
            instrumentCwd: config.instrumentCwd||process.cwd(),
            dsn: config.dsn||process.env['DSN']
          })
        }
      },
		},
	};
});
