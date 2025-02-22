import { createFileRoute } from '@tanstack/react-router';
import ProjectOverviewPage from '@/pages/ProjectOverviewPage';
// import ProjectOverviewPage from "../pages/ProjectOverviewPage";

export const Route = createFileRoute('/projects')({
  component: Projects,
});

function Projects() {
  return (
    <>
      <ProjectOverviewPage />
    </>
  );
}
