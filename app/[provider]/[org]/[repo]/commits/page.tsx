import CommitsClient from "@/components/repos/CommitsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ provider: string; org: string; repo: string }>;
}) {
  const resolved = await params;
  console.log(resolved, "providerproviderproviderprovider");
  return <CommitsClient params={resolved} />;
}


