import { useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import {
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import { RepoPullsDocument } from '@/helpers/backend/gen/graphql.ts';
import PullsList from './views/PullsList.tsx';

const Pulls = () => {
  const { repo } = useOutletContext<{ repo: { id: string } }>();
  const navigate = useNavigate();
  const params = useParams();

  type UIPull = {
    id: string;
    iid: number;
    title: string;
    author: string;
    createdAt: string;
    state: string;
    sourceBranch?: string;
    targetBranch?: string;
    webUrl?: string;
  };

  const [selectedPull, setSelectedPull] = useState<UIPull | null>(null);

  const { data } = useQuery(RepoPullsDocument, {
    variables: {
      repoID: repo.id,
    },
  });

  const pulls = useMemo(() => {
    const list = (data?.repoPulls?.pulls as any[]) || [];
    return list.map((item: any): UIPull => {
      const iid: number =
        typeof item?.iid === 'number' ? item.iid : Number(item?.iid) || 0;
      const projectId = item?.project_id ?? '';
      return {
        id: `${projectId}:${iid}`,
        iid,
        title: item?.title ?? '',
        author: item?.author?.name ?? '',
        createdAt: item?.created_at ?? '',
        state: item?.state ?? '',
        sourceBranch: item?.source_branch ?? '',
        targetBranch: item?.target_branch ?? '',
        webUrl: item?.web_url ?? '',
      };
    });
  }, [data]);

  useEffect(() => {
    if (params.pullNumber) {
      const pull = pulls.find(
        (p) => String(p.iid) === String(params.pullNumber),
      );
      if (pull) {
        setSelectedPull(pull);
      }
    }
  }, [params.pullNumber, pulls]);

  const handlePullSelect = (pull: UIPull) => {
    setSelectedPull(pull);

    // nav
    navigate(
      `/${params.provider}/${params.org}/${params.repo}/pulls/${pull.iid}`,
    );
  };

  return (
    <div className={'flex gap-[20px] px-[20px]'}>
      <PullsList
        pulls={pulls || []}
        onPullSelect={handlePullSelect}
        selectedPull={selectedPull}
      />
      <Outlet
        context={{
          repo,
          pull: selectedPull,
        }}
      />
    </div>
  );
};

export default Pulls;
