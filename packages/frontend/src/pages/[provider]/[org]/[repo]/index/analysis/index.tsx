import { useOutletContext } from 'react-router-dom';

type Repo = {
  id: string;
  pathWithNamespace: string;
  description: string;
  bu: string;
  tags: string;
  members: string;
  config: string;
  createdAt: string;
  updatedAt: string;
};

const AnalysisPage = () => {
  const { repo } = useOutletContext<{
    repo: Repo | null;
  }>();

  return (
    <div className={'px-[20px] py-[12px]'}>
      <h2>Analysis</h2>
      {repo && (
        <div>
          <p>Repository: {repo.pathWithNamespace}</p>
          <p>Description: {repo.description}</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
