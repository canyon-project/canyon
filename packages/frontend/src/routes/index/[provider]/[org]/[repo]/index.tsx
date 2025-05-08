// import {BaseLayout} from "canyon-ui";

import { useParams } from 'react-router-dom';
import ProjectDetailPage from '../../../../../pages/ProjectDetailPage';

const ProjectDetailRoute = () => {
  const params = useParams();


  return (
    <div>
      <div>
        <ProjectDetailPage />
      </div>
    </div>
  );
};

export default ProjectDetailRoute;
