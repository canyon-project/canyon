import { Typography } from 'antd';

const AppFooter = () => {
  // 构建信息（先写死）
  const buildTime = '1小时前'; // TODO: 后续可以从环境变量或构建时注入
  const branch = 'canary'; // TODO: 后续可以从环境变量获取
  const commitHash = 'dbb4d73'; // TODO: 后续可以从环境变量或构建时注入

  return (
    <div className="mt-8 pt-6 pb-10 dark:border-gray-700 ">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        {/* 左侧：描述和构建信息 */}
        <div className="flex flex-col gap-1">
          <Typography.Text type="secondary" className="text-sm">
            Canyon JavaScript Code Coverage Solution.
          </Typography.Text>
          <Typography.Text type="secondary" className="text-sm">
            构建于 {buildTime} · {branch} · {commitHash}
          </Typography.Text>
        </div>

        {/* 右侧：导航链接 */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            关于
          </a>
          <a
            href="#"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            文档
          </a>
          <a
            href="#"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            源码
          </a>
          <a
            href="#"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            社交媒体
          </a>
          <a
            href="#"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            聊天
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppFooter;
