import axios from 'axios';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecode } from '@/helpers/getDecode.ts';
import type { FileDataResponse } from '@canyonjs/report-component';

interface UseFileSelectParams {
  routeParams: {
    provider: string;
    org: string;
    repo: string;
    subject:
      | 'commit'
      | 'commits'
      | 'analysis'
      | 'analyses'
      | 'multiple-commits'
      | undefined;
    subjectID: string | undefined;
  };
  queryParams: {
    buildTarget: string;
    reportID: string;
    reportProvider: string;
    scene: string;
  };
  subjectForQuery: 'commit' | 'analysis';
  repoID: string;
  currentPath: string;
}

/**
 * 处理文件选择逻辑
 */
export const useFileSelect = (params: UseFileSelectParams) => {
  const navigate = useNavigate();

  const onSelect = useCallback(
    async (val: string): Promise<FileDataResponse> => {
      console.log(val,params.currentPath)
      // 检查当前 URL 中的路径
      const shouldUpdateUrl = params.currentPath !== val;

      // 只有当路径变化时才更新 URL，使用 replace 避免产生过多历史记录和死循环
      if (shouldUpdateUrl) {
        const newPath = `/report/-/${params.routeParams.provider}/${params.routeParams.org}/${params.routeParams.repo}/${params.routeParams.subject}/${params.routeParams.subjectID}/-/${val}`;
        navigate(newPath, { replace: true });
      }

      // 如果不是文件，返回空数据
      if (!val.includes('.')) {
        return {
          fileContent: '',
          fileCoverage: {},
          fileCodeChange: {
            additions: [],
            deletions: [],
          },
        };
      }

      // 检查必要参数
      if (
        !params.routeParams.subject ||
        !params.repoID ||
        !params.routeParams.subjectID
      ) {
        return {
          fileContent: '',
          fileCoverage: {},
          fileCodeChange: {
            additions: [],
            deletions: [],
          },
        };
      }

      try {
        // 根据 subject 类型确定如何获取文件内容
        let sha: string | undefined;

        if (
          params.routeParams.subject === 'commit' ||
          params.routeParams.subject === 'commits'
        ) {
          sha = params.routeParams.subjectID;
        } else if (
          params.routeParams.subject === 'analysis' ||
          params.routeParams.subject === 'analyses'
        ) {
          // analysis 格式为 afterCommitSHA...nowCommitSHA
          const parts = params.routeParams.subjectID.split('...');
          if (parts.length === 2) {
            sha = parts[1].trim();
          }
        } else if (params.routeParams.subject === 'multiple-commits') {
          // multiple-commits 格式为 commit1...commit2，使用 to (commit2) 作为 ref
          const parts = params.routeParams.subjectID.split('...');
          if (parts.length === 2) {
            sha = parts[1].trim();
          }
        }

        // 并行请求：文件内容、详细覆盖率数据
        const requests = [];

        // 1. 获取文件内容（只使用 now commit 的 sha）
        if (sha) {
          console.log(sha,'shashashasha')
          requests.push(
            axios
              .get('/api/code/file', {
                params: {
                  repoID: params.repoID,
                  sha,
                  filepath: val,
                  provider: params.routeParams.provider,
                },
              })
              .then((resp) => {
                if (resp.data?.content) {
                  return getDecode(resp.data?.content);
                }
                return '';
              })
              .catch((error) => {
                console.error('Failed to fetch file content:', error);
                return '';
              }),
          );
        } else {
          requests.push(Promise.resolve(''));
        }

        // 2. 获取详细的覆盖率数据（通过 /api/coverage/map）
        const fileCoverageParams: any = {
          provider: params.routeParams.provider,
          repoID: params.repoID,
          subject: params.subjectForQuery,
          subjectID: params.routeParams.subjectID,
          filePath: val,
        };
        if (params.queryParams.buildTarget)
          fileCoverageParams.buildTarget = params.queryParams.buildTarget;
        if (params.queryParams.reportProvider)
          fileCoverageParams.reportProvider = params.queryParams.reportProvider;
        if (params.queryParams.reportID)
          fileCoverageParams.reportID = params.queryParams.reportID;
        if (params.queryParams.scene)
          fileCoverageParams.scene = params.queryParams.scene;

        requests.push(
          axios
            .get('/api/coverage/map', {
              params: {
                ...fileCoverageParams,
                mode: 'blockMerge',
              },
            })
            .then((resp) => {
              // 返回的数据是一个对象，通过 filepath 获取特定文件的覆盖率信息
              return resp.data[val] || {};
            })
        );

        const [fileContent, fileCoverage] = await Promise.all(requests);

        // 从 fileCoverage 中提取 diff 信息
        const fileCodeChange = fileCoverage?.diff || {
          additions: [],
          deletions: [],
        };

        return {
          fileContent: fileContent || '',
          fileCoverage: fileCoverage || {},
          fileCodeChange,
        };
      } catch (error) {
        console.error('Failed to fetch file:', error);
        return {
          fileContent: '',
          fileCoverage: {},
          fileCodeChange: {
            additions: [],
            deletions: [],
          },
        };
      }
    },
    [
      params.routeParams,
      params.queryParams,
      params.subjectForQuery,
      params.repoID,
      params.currentPath,
    ],
  );

  return { onSelect };
};
