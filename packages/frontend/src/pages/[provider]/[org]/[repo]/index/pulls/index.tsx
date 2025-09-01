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
    const list =
      (data?.repoPulls?.pulls as Array<Record<string, unknown>>) || [];
    return list.map((item: Record<string, unknown>): UIPull => {
      const iid: number =
        typeof (item as { iid?: unknown })?.iid === 'number'
          ? ((item as { iid?: number }).iid as number)
          : Number((item as { iid?: unknown })?.iid) || 0;
      const projectId = (item as { project_id?: unknown })?.project_id ?? '';
      return {
        id: `${projectId}:${iid}`,
        iid,
        title: (item as { title?: string })?.title ?? '',
        author: (item as { author?: { name?: string } })?.author?.name ?? '',
        createdAt: (item as { created_at?: string })?.created_at ?? '',
        state: (item as { state?: string })?.state ?? '',
        sourceBranch: (item as { source_branch?: string })?.source_branch ?? '',
        targetBranch: (item as { target_branch?: string })?.target_branch ?? '',
        webUrl: (item as { web_url?: string })?.web_url ?? '',
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
      `/${params.provider}/${params.org}/${params.repo}/pulls/${pull.iid}/-/`,
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
