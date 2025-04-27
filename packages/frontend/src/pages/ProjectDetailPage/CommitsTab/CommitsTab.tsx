import CommitsList from './CommitsList';
import { useState } from 'react';
import CommitsDetail from './CommitsDetail';
import { useParams } from 'react-router-dom';
// import { useQuery } from "@apollo/client";
// import { GetProjectCommitsDocument } from "@/graphql/gen/graphql.ts";

const CommitsTab = () => {
  const params = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedCommit, setSelectedCommit] = useState(null);

  const { data, loading, error } = {
    data: {
      getProjectCommits: {
        data: [],
      },
    },
    loading: false,
    error: false,
  };

  const handleCommitSelect = (commit) => {
    setSelectedCommit(commit);
  };

  if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={'flex gap-[20px] px-[20px]'}>
      <CommitsList
        commits={data?.getProjectCommits?.data || []}
        onCommitSelect={handleCommitSelect}
        selectedCommit={selectedCommit}
      />
      <CommitsDetail selectedCommit={selectedCommit} />
    </div>
  );
};

export default CommitsTab;
