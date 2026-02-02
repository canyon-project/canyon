import type { CanyonReportProps } from '@canyonjs/report-component';
import { CanyonReport } from '@canyonjs/report-component';
import { useRequest } from 'ahooks';
import { Spin } from 'antd';
import axios from 'axios';
import { useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getDecode } from '@/helpers/getDecode.ts';

// ==================== 类型定义 ====================

type FileDataResponse = Awaited<ReturnType<CanyonReportProps['onSelect']>>;

type SubjectType = 'commit' | 'accumulative' | undefined;

interface RouteParams {
  provider: string;
  org: string;
  repo: string;
  subject: SubjectType;
  subjectID: string | undefined;
}

interface QueryParams {
  buildTarget: string;
  reportID: string;
  reportProvider: string;
  scene: string;
}

// ==================== 主组件 ====================

const ReportIndependent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  // ==================== 路由和查询参数处理 ====================

  const subjectID = params.subjectID;
  const subject = params.subject as SubjectType;
  const provider = params.provider as string;
  const org = params.org as string;
  const repo = params.repo as string;

  // 路由参数
  const routeParams = useMemo<RouteParams>(
    () => ({
      provider,
      org,
      repo,
      subject,
      subjectID,
    }),
    [provider, org, repo, subject, subjectID],
  );

  // 查询参数
  const queryParams = useMemo<QueryParams>(
    () => ({
      buildTarget: searchParams.get('build_target') || '',
      reportID: searchParams.get('report_id') || '',
      reportProvider: searchParams.get('report_provider') || '',
      scene: searchParams.get('scene') || '',
    }),
    [searchParams],
  );

  // 当前激活的路径
  const activatedPath = useMemo(
    () => params['*']?.replace('-/', '') || '',
    [params['*']],
  );

  // ==================== 获取 repoID ====================

  const { data: repoData } = useRequest(
    async () => {
      const repoId = `${org}/${repo}`;
      const resp = await axios.get(`/api/repos/${encodeURIComponent(repoId)}`, {
        withCredentials: true,
      });
      return resp.data;
    },
    { refreshDeps: [org, repo] },
  );

  const repoID = repoData?.id || '';

  // ==================== 获取覆盖率摘要映射数据 ====================

  const { data: mapData, loading } = useRequest(
    () =>
      axios('/api/coverage/summary/map', {
        params: {
          subject: subject,
          subjectID: routeParams.subjectID,
          buildTarget: queryParams.buildTarget,
          repoID,
          provider: routeParams.provider,
          reportID: queryParams.reportID,
          reportProvider: queryParams.reportProvider,
          scene: queryParams.scene,
        },
      }).then(({ data }) => data),
    {
      refreshDeps: [
        subject,
        routeParams.subjectID,
        queryParams.buildTarget,
        queryParams.reportID,
        queryParams.reportProvider,
        repoID,
        queryParams.scene,
        routeParams.provider,
      ],
      ready: !!repoID, // 只有当 repoID 存在时才请求
    },
  );

  // 将对象格式转换为数组格式
  const data = useMemo(
    () =>
      mapData
        ? Object.values(mapData).map((item: any) => ({
            ...item,
            path: item.path || '',
          }))
        : [],
    [mapData],
  );

  // ==================== 从 subjectID 中提取 SHA ====================

  const extractSHA = useCallback(
    (
      subject: SubjectType,
      subjectID: string | undefined,
    ): string | undefined => {
      if (!subjectID) return undefined;

      if (subject === 'commit') {
        return subjectID;
      }

      if (subject === 'accumulative') {
        // 格式为 beforeCommitSHA...afterCommitSHA，使用 after (第二个) 作为 ref
        const parts = subjectID.split('...');
        if (parts.length === 2) {
          return parts[1].trim();
        }
      }

      return undefined;
    },
    [],
  );

  // ==================== 处理文件选择逻辑 ====================

  // 缓存请求结果：key -> Promise<result>
  const fileContentCacheRef = useRef<Map<string, Promise<string>>>(new Map());
  const coverageMapCacheRef = useRef<Map<string, Promise<any>>>(new Map());

  const onSelect = useCallback(
    async (val: string): Promise<FileDataResponse> => {
      const emptyResponse: FileDataResponse = {
        fileContent: '',
        fileCoverage: {
          path: '',
          statementMap: {},
          fnMap: {},
          branchMap: {},
          s: {},
          f: {},
          b: {},
        },
        fileCodeChange: {
          additions: [],
          deletions: [],
        },
      };

      // 更新 URL（只有当路径变化时才更新）
      if (activatedPath !== val) {
        const newPath = `/report/-/${routeParams.provider}/${routeParams.org}/${routeParams.repo}/${routeParams.subject}/${routeParams.subjectID}/-/${val}`;
        // 保留查询参数
        const searchParamsString = searchParams.toString();
        const fullPath = searchParamsString
          ? `${newPath}?${searchParamsString}`
          : newPath;
        navigate(fullPath, { replace: true });
      }

      // 如果不是文件，返回空数据
      if (!val.includes('.')) {
        return emptyResponse;
      }

      // 检查必要参数
      if (!routeParams.subject || !repoID || !routeParams.subjectID) {
        return emptyResponse;
      }

      const sha = extractSHA(routeParams.subject, routeParams.subjectID);

      // 生成缓存 key
      const fileContentKey = sha
        ? `${repoID}-${sha}-${val}-${routeParams.provider}`
        : null;

      // 此时 subject 和 subjectID 已经确定不为空
      const fileCoverageParams: Record<string, string> = {
        provider: routeParams.provider,
        repoID,
        subject: routeParams.subject,
        subjectID: routeParams.subjectID,
        filePath: val,
      };

      if (queryParams.buildTarget) {
        fileCoverageParams.buildTarget = queryParams.buildTarget;
      }
      if (queryParams.reportProvider) {
        fileCoverageParams.reportProvider = queryParams.reportProvider;
      }
      if (queryParams.reportID) {
        fileCoverageParams.reportID = queryParams.reportID;
      }
      if (queryParams.scene) {
        fileCoverageParams.scene = queryParams.scene;
      }

      const coverageMapKey = `${repoID}-${subject}-${routeParams.subjectID}-${val}-${queryParams.buildTarget}-${queryParams.reportID}-${queryParams.reportProvider}-${queryParams.scene}`;

      // 获取或创建文件内容请求
      let fileContentPromise: Promise<string>;
      if (fileContentKey && fileContentCacheRef.current.has(fileContentKey)) {
        fileContentPromise = fileContentCacheRef.current.get(fileContentKey)!;
      } else if (sha) {
        fileContentPromise = axios
          .get('/api/code/file', {
            params: {
              repoID,
              sha,
              filepath: val,
              provider: routeParams.provider,
            },
          })
          .then((resp) => {
            if (resp.data?.content) {
              return getDecode(resp.data.content);
            }
            return '';
          });
        if (fileContentKey) {
          fileContentCacheRef.current.set(fileContentKey, fileContentPromise);
        }
      } else {
        fileContentPromise = Promise.resolve('');
      }

      // 获取或创建覆盖率数据请求
      let coverageMapPromise: Promise<any>;
      if (coverageMapCacheRef.current.has(coverageMapKey)) {
        coverageMapPromise = coverageMapCacheRef.current.get(coverageMapKey)!;
      } else {
        coverageMapPromise = axios
          .get('/api/coverage/map', {
            params: {
              ...fileCoverageParams,
              mode: 'blockMerge',
            },
          })
          .then((resp) => resp.data[val] || emptyResponse.fileCoverage);
        coverageMapCacheRef.current.set(coverageMapKey, coverageMapPromise);
      }

      // 等待所有请求完成
      const [fileContent, fileCoverage] = await Promise.all([
        fileContentPromise,
        coverageMapPromise,
      ]);

      // 从 fileCoverage 中提取 diff 信息
      const fileCodeChange = fileCoverage?.diff || {
        additions: [],
        deletions: [],
      };

      return {
        fileContent: fileContent || '',
        fileCoverage: fileCoverage || emptyResponse.fileCoverage,
        fileCodeChange,
      };
    },
    [
      activatedPath,
      routeParams,
      queryParams,
      subject,
      repoID,
      navigate,
      extractSHA,
    ],
  );

  // ==================== 渲染 ====================

  return (
    <Spin spinning={loading}>
      <div className='p-[6px]'>
        <div
          style={{
            height: 'calc(100vh - 12px)',
          }}
        >
          <CanyonReport
            name={routeParams.repo}
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
