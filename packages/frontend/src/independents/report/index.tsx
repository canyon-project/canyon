import { CanyonReport } from '@canyonjs/report-component';
import { useRequest } from 'ahooks';
import { Spin } from 'antd';
import axios from 'axios';
import { useCallback, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getDecode } from '@/helpers/getDecode.ts';

const ReportIndependent = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const [activatedPath, setActivatedPath] = useState(
    params['*']?.replace('-/', '') || '',
  );

  const subjectID = params.subjectID;
  const subject = params.subject as
    | 'commit'
    | 'commits'
    | 'analysis'
    | 'analyses'
    | 'multiple-commits'
    | undefined;
  const buildTarget = searchParams.get('build_target') || '';
  const reportID = searchParams.get('report_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';
  const scene = searchParams.get('scene') || '';
  const provider = params.provider as string;
  const org = params.org as string;
  const repo = params.repo as string;

  // 将 subject 映射为后端接口需要的格式
  // 'commits' -> 'commit', 'analyses' -> 'analysis', 'multiple-commits' -> 'commit'
  const subjectForQuery = useMemo((): 'commit' | 'analysis' => {
    if (subject === 'analysis' || subject === 'analyses') {
      return 'analysis';
    }
    // 'commit', 'commits', 'multiple-commits' 都映射为 'commit'
    return 'commit';
  }, [subject]);

  // 获取 repoID
  const { data: repoData } = useRequest(
    async () => {
      const repoId = `${org}/${repo}`;
      const resp = await fetch(`/api/repos/${encodeURIComponent(repoId)}`, {
        credentials: 'include',
      });
      if (resp.ok) {
        return resp.json();
      }
      return null;
    },
    { refreshDeps: [org, repo] },
  );

  const repoID = repoData?.id || '';
  console.log(scene, 'scene');
  const { data: mapData, loading } = useRequest(
    () =>
      axios('/api/coverage/summary/map', {
        params: {
          subject: subjectForQuery,
          subjectID,
          buildTarget,
          repoID,
          provider,
          reportID,
          reportProvider,
          scene,
        },
      }).then(({ data }) => data),
    {
      refreshDeps: [
        subjectForQuery, // 使用映射后的 subject
        subjectID,
        buildTarget,
        reportID,
        reportProvider,
        repoID,
        scene,
      ],
      ready: !!repoID, // 只有当 repoID 存在时才请求
    },
  );

  // 将对象格式转换为数组格式
  const data = mapData
    ? Object.values(mapData).map((item: any) => ({
        ...item,
        path: item.path || '',
      }))
    : [];

  const onSelect = useCallback(
    async (val: string) => {
      setActivatedPath(val);
      if (!val.includes('.')) {
        return {
          fileContent: '',
          fileCoverage: {},
          fileCodeChange: [],
        };
      }
      if (!subject || !repoID || !subjectID) {
        return {
          fileContent: '',
          fileCoverage: {},
          fileCodeChange: [],
        };
      }

      try {
        // 根据 subject 类型确定如何获取文件内容
        let sha: string | undefined;

        if (subject === 'commit' || subject === 'commits') {
          sha = subjectID;
        } else if (subject === 'analysis' || subject === 'analyses') {
          // analysis 格式为 afterCommitSHA...nowCommitSHA
          // 只需要关心 now commit，使用 nowCommitSHA (后面的部分) 作为 ref
          const parts = subjectID.split('...');
          if (parts.length === 2) {
            sha = parts[1].trim();
          }
        } else if (subject === 'multiple-commits') {
          // multiple-commits 格式为 commit1...commit2，使用 to (commit2) 作为 ref
          const parts = subjectID.split('...');
          if (parts.length === 2) {
            sha = parts[1].trim();
          }
        }

        // 并行请求：文件内容、详细覆盖率数据
        const requests = [];

        // 1. 获取文件内容（只使用 now commit 的 sha）
        if (sha) {
          requests.push(
            axios
              .get('/api/code/file', {
                params: {
                  repoID,
                  sha,
                  filepath: val,
                  provider,
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
          provider,
          repoID,
          subject: subjectForQuery, // 使用统一的 subject 映射
          subjectID,
          filePath: val,
        };
        if (buildTarget) fileCoverageParams.buildTarget = buildTarget;
        if (reportProvider) fileCoverageParams.reportProvider = reportProvider;
        if (reportID) fileCoverageParams.reportID = reportID;
        console.log(scene, 'scene');
        if (scene) fileCoverageParams.scene = scene;

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
            .catch((error) => {
              console.error('Failed to fetch coverage map:', error);
              // 如果请求失败，尝试从 summary/map 数据中获取
              const fileData = data?.find((item: any) => item.path === val);
              return fileData || {};
            }),
        );

        const [fileContent, fileCoverage] = await Promise.all(requests);

        // 从 fileCoverage 中提取 diff 信息（additions 数组）
        // 根据类型定义，fileCodeChange 应该是 number[]，但实际使用时需要转换为对象
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
          fileCodeChange: [],
        };
      }
    },
    [
      subjectForQuery,
      repoID,
      subjectID,
      provider,
      buildTarget,
      reportID,
      reportProvider,
      data,
    ],
  );

  return (
    <Spin spinning={loading}>
      <div className={'p-[6px]'}>
        <div
          style={{
            height: 'calc(100vh - 12px)',
          }}
        >
          <CanyonReport
            name={repo}
            value={activatedPath}
            onSelect={onSelect}
            dataSource={data}
          />
        </div>
      </div>
    </Spin>
  );
};

export default ReportIndependent;
