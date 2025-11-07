export default function Loading() {
  const rows = Array.from({ length: 12 });
  return (
    <div className="w-full overflow-hidden bg-black relative">
      {/* Header skeleton */}
      <div className="border-b border-[#808080]">
        <div className="md:max-w-[94%] m-auto">
          <div className="px-6 flex justify-center items-center">
            <div className="xl:max-w-[1440px] w-full py-6">
              <div className="h-10 w-44 bg-neutral-800/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-neutral-800/60 rounded animate-pulse" />
            <div className="h-4 w-72 bg-neutral-800/40 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-56 bg-neutral-900 rounded-md border border-neutral-800 animate-pulse" />
            <div className="h-8 w-28 bg-neutral-900 rounded-md border border-neutral-800 animate-pulse" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-neutral-800 shadow-sm">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-900/60">
              <tr>
                {['Rank','Wallet','Balance','X Username','X Verified','Verification Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {rows.map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><div className="h-4 w-8 bg-neutral-800/60 rounded animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 bg-neutral-800/60 rounded animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-neutral-800/60 rounded animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-28 bg-neutral-800/60 rounded animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-24 bg-neutral-800/60 rounded-full animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-24 bg-neutral-800/60 rounded-full animate-pulse" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="h-4 w-56 bg-neutral-800/40 rounded animate-pulse" />
          <div className="h-9 w-80 bg-neutral-900 rounded-md border border-neutral-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

