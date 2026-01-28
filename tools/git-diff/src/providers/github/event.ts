import { readFileSync } from 'node:fs';

/**
 * 从 GitHub Actions event 文件中获取 before SHA
 * @returns before SHA，如果不存在则返回 null
 */
export function getGitHubEventBefore(): string | null {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return null;
  }

  try {
    const eventContent = readFileSync(eventPath, 'utf-8');
    const event = JSON.parse(eventContent);
    // push 事件中有 before 字段
    return event.before || null;
  } catch (error) {
    console.warn('Warning: Failed to read GITHUB_EVENT_PATH', error);
    return null;
  }
}
