import { redirect } from "next/navigation";

export default async function RepoIndex({
  params,
}: {
  params: Promise<{ provider: string; org: string; repo: string }>;
}) {
  const { provider, org, repo } = await params;
  redirect(`/${provider}/${org}/${repo}/commits`);
}


