import { Typography } from 'antd';
import { useMemo } from 'react';

const AppFooter = () => {
  // 计算相对时间
  const buildTimeRelative = useMemo(() => {
    const buildTimeStr =
      typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : null;
    if (!buildTimeStr) {
      return '1小时前';
    }

    try {
      const buildTime = new Date(buildTimeStr);
      const now = new Date();
      const diffMs = now.getTime() - buildTime.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 60) {
        return '刚刚';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        // 超过7天，显示具体日期
        return buildTime.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      return '1小时前';
    }
  }, []);

  // 构建信息（从构建时注入）
  const branch =
    typeof __GIT_BRANCH__ !== 'undefined' ? __GIT_BRANCH__ : 'canary';
  const commitHash =
    typeof __GIT_COMMIT_HASH__ !== 'undefined'
      ? __GIT_COMMIT_HASH__
      : 'dbb4d73';
  const commitHashFull =
    typeof __GIT_COMMIT_HASH_FULL__ !== 'undefined'
      ? __GIT_COMMIT_HASH_FULL__
      : '';
  const githubRepo =
    typeof __GITHUB_REPO__ !== 'undefined'
      ? __GITHUB_REPO__
      : 'canyon-project/canyon';

  // 构建 commit 链接（使用完整 hash）
  const commitUrl = commitHashFull
    ? `https://github.com/${githubRepo}/commit/${commitHashFull}`
    : `https://github.com/${githubRepo}/commit/${commitHash}`;

  return (
    <div className="mt-8 pt-6 pb-10 dark:border-gray-700 ">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        {/* 左侧：描述和构建信息 */}
        <div className="flex flex-col gap-1">
          <Typography.Text type="secondary" className="text-sm">
            Canyon JavaScript Code Coverage Solution.
          </Typography.Text>
          <Typography.Text type="secondary" className="text-sm">
            构建于 {buildTimeRelative} · {branch} ·{' '}
            <a
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline"
            >
              {commitHash}
            </a>
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
