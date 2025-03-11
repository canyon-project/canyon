import CommitsList from './CommitsList';
import { useEffect, useState } from 'react';
import { fetchCommits } from '@/services/api.ts';
import CommitsDetail from './CommitsDetail';

const CommitsTab = () => {
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [testType, setTestType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCommits();
        setCommits(data);
        if (data.length > 0) {
          setSelectedCommit(data[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch commits:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCommitSelect = (commit) => {
    setSelectedCommit(commit);
  };

  return (
    <div className={'flex gap-[20px] px-[20px]'}>
      {/*<div className={'w-[6px]'}></div>*/}
      <CommitsList
        commits={commits}
        onCommitSelect={handleCommitSelect}
        selectedCommit={selectedCommit}
      />
      <CommitsDetail />
    </div>
  );
};

export default CommitsTab;
