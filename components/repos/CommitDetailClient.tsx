'use client';
export default function CommitDetailClient({ params }: { params: { provider: string; org: string; repo: string } }) {
  const { provider, org, repo } = params;

  return (
    <div>
      <h1>Commits for {repo} in {org} ({provider})</h1>
      {/* Here you would typically fetch and display the commits */}
      <p>This is a placeholder for the commits list.</p>
    </div>
  );
}