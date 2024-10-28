"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestCoverage() {
  const [latestCoverage] = api.coverage.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createCoverage = api.coverage.create.useMutation({
    onSuccess: async () => {
      await utils.coverage.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestCoverage ? (
        <p className="truncate">Your most recent coverage: {latestCoverage.name}</p>
      ) : (
        <p>You have no coverages yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createCoverage.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createCoverage.isPending}
        >
          {createCoverage.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
