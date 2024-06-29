import axios from 'axios';

interface FileInfo {
  file_name: string;
  file_path: string;
  size: number;
  encoding: string;
  content_sha256: string;
  ref: string;
  blob_id: string;
  commit_id: string;
  last_commit_id: string;
  content: string;
}

interface Commit {
  id: string;
  short_id: string;
  created_at: string;
  parent_ids: string[];
  title: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
  web_url: string;
  ci_reports: any[];
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  status: string;
  project_id: number;
  last_pipeline: {
    id: number;
    project_id: number;
    sha: string;
    ref: string;
    status: string;
    created_at: string;
    updated_at: string;
    web_url: string;
  };
}

export interface ProjectInfo {
  id: number;
  description: string;
  main_language: string;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: string;
  default_branch: string;
  tag_list: string[];
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
  avatar_url: string | null;
  forks_count: number;
  star_count: number;
  last_activity_at: string;
  bu: string;
  properties: {
    node_version: string;
  };
  packages_enabled: boolean;
  empty_repo: boolean;
  archived: boolean;
  visibility: string;
  resolve_outdated_diff_discussions: boolean;
  container_registry_enabled: boolean;
  issues_enabled: boolean;
  merge_requests_enabled: boolean;
  wiki_enabled: boolean;
  jobs_enabled: boolean;
  snippets_enabled: boolean;
  service_desk_enabled: boolean;
  service_desk_address: string | null;
  can_create_merge_request_in: boolean;
  issues_access_level: string;
  repository_access_level: string;
  merge_requests_access_level: string;
  forking_access_level: string;
  wiki_access_level: string;
  builds_access_level: string;
  snippets_access_level: string;
  pages_access_level: string;
  operations_access_level: string;
  analytics_access_level: string;
  emails_disabled: any; // You may want to define a more specific type here
  shared_runners_enabled: boolean;
  lfs_enabled: boolean;
  creator_id: number;
  import_status: string;
  import_error: string | null;
  open_issues_count: number;
  runners_token: string;
  ci_default_git_depth: number;
  ci_forward_deployment_enabled: boolean;
  public_jobs: boolean;
  build_git_strategy: string;
  build_timeout: number;
  auto_cancel_pending_pipelines: string;
  build_coverage_regex: string | null;
  ci_config_path: string | null;
  shared_with_groups: any[]; // You may want to define a more specific type here
  only_allow_merge_if_pipeline_succeeds: boolean;
  allow_merge_on_skipped_pipeline: any; // You may want to define a more specific type here
  restrict_user_defined_variables: boolean;
  request_access_enabled: boolean;
  only_allow_merge_if_all_discussions_are_resolved: boolean;
  remove_source_branch_after_merge: boolean;
  printing_merge_request_link_enabled: boolean;
  merge_method: string;
  suggestion_commit_message: string | null;
  auto_devops_enabled: boolean;
  auto_devops_deploy_strategy: string;
  autoclose_referenced_issues: boolean;
}

const { GITLAB_URL } = process.env;
console.log(GITLAB_URL,'GITLAB_URL')
export const getFileInfo = async (
  {
    projectID,
    filepath,
    commitSha,
  }: { projectID: string; filepath: string; commitSha: string },
  token: string,
) => {
  return await axios
    .get<FileInfo>(
      `${GITLAB_URL}/api/v4/projects/${projectID}/repository/files/${filepath}`,
      {
        params: {
          ref: commitSha,
        },
        headers: {
          // Authorization: `Bearer ${token}`,
          'private-token': process.env.PRIVATE_TOKEN,
        },
      },
    )
    .then(({ data }) => data);
};
export const getCommits = async (
  { projectID, commitShas }: { projectID: string; commitShas: string[] },
  token: string,
) => {
  return await Promise.all(
    commitShas.map((commitSha) => {
      return axios
        .get<Commit>(
          `${GITLAB_URL}/api/v4/projects/${projectID}/repository/commits/${commitSha}`,
          {
            headers: {
              // Authorization: `Bearer ${token}`,
              'private-token': process.env.PRIVATE_TOKEN,
            },
          },
        )
        .then(({ data }) => data)
        .catch(() => {
          return {
            id: commitSha,
            message: '???',
            web_url: '???',
          };
        });
    }),
  );
};

export async function getProjectByID(projectID: string, token: string) {
  return await axios
    .get<ProjectInfo>(`${GITLAB_URL}/api/v4/projects/${projectID}`, {
      headers: {
        // Authorization: `Bearer ${token}`,
        'private-token': process.env.PRIVATE_TOKEN,
      },
    })
    .then(({ data }) => data);
}
