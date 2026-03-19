import { Typography } from "antd";

const AppFooter = () => {
  return (
    <div className="mt-8 pt-6 pb-10 dark:border-gray-700 ">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col gap-1">
          <Typography.Text type="secondary" className="text-sm">
            Canyon JavaScript Code Coverage Solution
          </Typography.Text>
        </div>

        {/* 右侧：导航链接 */}
        <div className="flex items-center gap-4">
          <a
            href="/api/ui"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            API
          </a>
          <a
            href="https://docs.canyonjs.io"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            文档
          </a>
          <a
            href="https://github.com/canyon-project/canyon"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            贡献
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppFooter;
