'use client';
import { CanyonReport } from '@canyonjs/report-component';
import { useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

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

const Page = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 路由参数
  const provider = params.provider as string;
  const org = params.org as string;
  const repo = params.repo as string;
  const subject = params.subject as SubjectType;
  const subjectID = params.subjectID as string | undefined;
  const pathSegments = params.path as string[] | undefined;

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

  // 当前激活的路径 - 处理 /-/ 后面的路径
  const activatedPath = useMemo(() => {
    if (!pathSegments || pathSegments.length === 0) {
      return '';
    }
    // 如果第一个路径段是 '-'，则移除它，然后拼接剩余路径
    const segments = pathSegments[0] === '-' ? pathSegments.slice(1) : pathSegments;
    return segments.join('/');
  }, [pathSegments]);

  // onSelect 函数，更新 URL 但不发送请求
  const onSelect = useCallback(
    async (val: string) => {
      // 更新 URL（只有当路径变化时才更新）
      if (activatedPath !== val) {
        const basePath = `/${routeParams.provider}/${routeParams.org}/${routeParams.repo}/${routeParams.subject}/${routeParams.subjectID}`;
        const newPath = val ? `${basePath}/-/${val}` : basePath;
        // 保留查询参数
        const searchParamsString = searchParams.toString();
        const fullPath = searchParamsString ? `${newPath}?${searchParamsString}` : newPath;
        router.replace(fullPath);
      }

      // 返回空数据，不发送请求
      return {
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
    },
    [activatedPath, routeParams, searchParams, router],
  );

  return (
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
          dataSource={[]}
        />
      </div>
    </div>
  );
};

export default Page;
