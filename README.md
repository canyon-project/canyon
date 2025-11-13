# canyon纳入playwright官方推荐

## 需要一个最简版本

- 路由只保留/report/-/gitlab/canyon-project/canyon/commits/xxxxxx/-/path/to?build_target=crn
- 后端只保留/coverage 概览等接口
- 环境变量，只保留priv_token给鉴权
- /coverage/client 上报接口保留
- ci中必须得分离
- @canyonjs/plugin-babel
- 抛弃Chrome插件
- 文档重来，只留英文
- main 分支完全覆盖掉
- @canyonjs/cli
- 暂时不要diff功能，就纯收集
