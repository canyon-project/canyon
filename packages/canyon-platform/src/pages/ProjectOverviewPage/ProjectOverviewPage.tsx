import { useQuery } from '@apollo/client';
import { GetProjectsDocument } from '@/graphql/gen/graphql.ts';

const ProjectOverviewPage = () => {
  const { data } = useQuery(GetProjectsDocument, {
    variables: {
      current: 1,
      pageSize: 10,
    },
  });
  return <div>{JSON.stringify(data?.getProjects || [])}</div>;
};

export default ProjectOverviewPage;
