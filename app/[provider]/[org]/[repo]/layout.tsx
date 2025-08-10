// import RepoTabs from "@/components/repos/RepoTabs";

import RepoTabs from "@/components/repos/RepoTabs";

export default async function RepoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ provider: string; org: string; repo: string }>;
}) {
  const { provider, org, repo } = await params;
  const basePath = `/${provider}/${org}/${repo}`;
  return (
    <div className="space-y-4">
      <div className="px-4 pt-2">
        <h1 className="text-lg font-semibold">{org}/{repo}</h1>
      </div>
      <RepoTabs basePath={basePath} />
      <div className="px-4 pb-6">{children}</div>
    </div>
  );
}


