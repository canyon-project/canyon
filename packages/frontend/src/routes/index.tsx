import { createFileRoute } from '@tanstack/react-router';
import ProjectOverviewPage from '@/pages/ProjectOverviewPage';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div>
      <ProjectOverviewPage />
    </div>
  );
}
