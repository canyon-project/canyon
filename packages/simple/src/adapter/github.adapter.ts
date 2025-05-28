import axios from 'axios';

// GitHub API 返回的文件信息结构
export interface GitHubFileInfo {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string; // Base64 编码的内容
  encoding: string; // 通常是 "base64"
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

// GitHub API 返回的提交信息结构
export interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: null | string;
      payload: null | string;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  committer: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  parents: [
    {
      sha: string;
      url: string;
      html_url: string;
    },
  ];
}

// GitHub API 返回的仓库信息结构
export interface GitHubRepoInfo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  mirror_url: null | string;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  };
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics: string[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  temp_clone_token: null | string;
  network_count: number;
  subscribers_count: number;
}

/**
 * 获取 GitHub 仓库中的文件信息
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @param filepath 文件路径
 * @param commitSha 提交哈希或分支名称
 * @param token GitHub API 令牌
 * @returns 文件信息
 */
export const getGitHubFileInfo = async (
  {
    projectID,
    filepath,
    commitSha = 'main',
  }: { projectID: string; filepath: string; commitSha?: string },
  token: string,
) => {
  // 对文件路径进行 URL 编码
  const encodedPath = (filepath);

  console.log(projectID,filepath,commitSha)

  return await axios
    .get<GitHubFileInfo>(
      `https://api.github.com/repos/${projectID}/contents/${encodedPath}`,
      {
        params: {
          ref: commitSha,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    )
    .then(({ data }) => {
      // 处理 Base64 编码的内容
      if (data.content) {
        data.content = Buffer.from(data.content, 'base64').toString('utf8');
      }
      return data;
    });
};

/**
 * 获取 GitHub 提交信息
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @param commitShas 提交哈希列表
 * @param token GitHub API 令牌
 * @returns 提交信息列表
 */
export const getGitHubCommits = async (
  {
    owner,
    repo,
    commitShas,
  }: { owner: string; repo: string; commitShas: string[] },
  token: string,
) => {
  return await Promise.all(
    commitShas.map((commitSha) => {
      return axios
        .get<GitHubCommit>(
          `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        )
        .then(({ data }) => data)
        .catch((error) => {
          console.error(`获取提交 ${commitSha} 失败:`, error.message);
          return {
            sha: commitSha,
            commit: {
              message: '无法获取提交信息',
              author: {
                name: '未知',
                email: '',
                date: new Date().toISOString(),
              },
              committer: {
                name: '未知',
                email: '',
                date: new Date().toISOString(),
              },
            },
            html_url: `https://github.com/${owner}/${repo}/commit/${commitSha}`,
          } as GitHubCommit;
        });
    }),
  );
};

/**
 * 获取 GitHub 仓库信息
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @param token GitHub API 令牌
 * @returns 仓库信息
 */
export async function getGitHubRepoInfo(
  { owner, repo }: { owner: string; repo: string },
  token: string,
) {
  return await axios
    .get<GitHubRepoInfo>(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })
    .then(({ data }) => data);
}
