import LoginPage from '@/pages/LoginPage';
import { createFileRoute } from '@tanstack/react-router';
// import ProjectOverviewPage from "@/pages/ProjectOverviewPage";

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  return (
    <div>
      <LoginPage />
    </div>
  );
}
