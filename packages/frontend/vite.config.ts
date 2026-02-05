import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import * as dotenv from 'dotenv';
import { execSync } from 'node:child_process';
import * as path from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';

dotenv.config({
  path: [path.resolve(__dirname, '../../.env')],
});

const apiTarget = process.env.VITE_API_TARGET || 'http://127.0.0.1:8080';

// 获取 git commit hash（短版本，用于显示）
function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

// 获取 git commit hash（完整版本，用于链接）
function getGitCommitHashFull(): string {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}


// 获取构建时间（ISO 格式字符串，用于运行时计算相对时间）
function getBuildTime(): string {
  return new Date().toISOString();
}

// 获取当前分支
function getGitBranch(): string {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
    }).trim();
    // 如果是 main/master，返回 'main'，否则返回分支名
    return branch === 'master' ? 'main' : branch;
  } catch {
    return 'canary';
  }
}

// 获取 GitHub 仓库信息（owner/repo）
function getGitHubRepo(): string {
  try {
    // 获取 remote URL
    const remoteUrl = execSync('git config --get remote.origin.url', {
      encoding: 'utf-8',
    }).trim();

    // 处理不同的 URL 格式：
    // - https://github.com/owner/repo.git
    // - git@github.com:owner/repo.git
    // - https://github.com/owner/repo
    let match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
  } catch {
    // 如果获取失败，返回默认值
  }
  return 'canyon-project/canyon'; // 默认值
}

export default defineConfig({
  plugins: [
    react(),
    Pages({
      exclude: ['**/views/**', '**/helpers/**'],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __GIT_COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
    __GIT_COMMIT_HASH_FULL__: JSON.stringify(getGitCommitHashFull()),
    __BUILD_TIME__: JSON.stringify(getBuildTime()),
    __GIT_BRANCH__: JSON.stringify(getGitBranch()),
    __GITHUB_REPO__: JSON.stringify(getGitHubRepo()),
  },
  server: {
    port: 8000,
    host: '0.0.0.0',
    proxy: {
      '^/graphql|^/api': {
        changeOrigin: true,
        target: apiTarget,
      },
    },
  },
});
