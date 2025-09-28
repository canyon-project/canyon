import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout.tsx';
import {useQuery} from "@apollo/client";
import {ReposDocument} from "@/helpers/backend/gen/graphql.ts";

const IndexPage = () => {
  // const navigate = useNavigate();
  const {data} = useQuery(ReposDocument)
  useEffect(() => {
    // navigate(`/projects`);
  });
  return (
    <BasicLayout>
      <span className={'bg-blue-300'}>projects</span>
      {
        JSON.stringify(data||{})
      }
    </BasicLayout>
  );
};

export default IndexPage;
