import CommitDetailClient from "@/components/repos/CommitDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ provider: string; org: string; repo: string; sha: string }>;
}) {
  const resolved = await params;
  return <CommitDetailClient params={resolved} />;
}


