import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const IndexPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/projects`);
  });
  return (
    <BasicLayout>
      <span className={'bg-amber-500'}>IndexPage</span>
    </BasicLayout>
  );
};

export default IndexPage;
