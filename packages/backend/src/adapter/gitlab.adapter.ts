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

export const getFileInfo = async (
  {
    projectID,
    filepath,
    commitSha,
  }: { projectID: string; filepath: string; commitSha: string },
  token: string,
  gitProviderUrl: string,
) => {
  return await axios
    .get<FileInfo>(
      new URL(
        `/api/v4/projects/${projectID}/repository/files/${filepath}`,
        gitProviderUrl,
      ).toString(),
      {
        params: {
          ref: commitSha,
        },
        headers: {
          // Authorization: `Bearer ${token}`,
          'private-token': token,
        },
      },
    )
    .then(({ data }) => data);
};
