import Navbar from "@/components/ui/Navbar";

interface StatsData {
  totalEstimatedPopulation: number;
  totalSynagogues: number;
  totalKosherEstablishments: number;
  totalJCCs: number;
  statesWithData: number;
  topMetros: { rank: number; name: string; cdi: number }[];
  topZIPs: { rank: number; zip: string; area: string; cdi: number }[];
  cdiDistribution: Record<string, number>;
}

async function getStats(): Promise<StatsData> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const data = await fs.readFile(
    path.join(process.cwd(), "public/data/stats.json"),
    "utf-8"
  );
  return JSON.parse(data);
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default async function StatsPage() {
  const stats = await getStats();
  const maxDist = Math.max(...Object.values(stats.cdiDistribution));

  return (
    <main className="bg-bg-primary min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          Statistics
        </h1>
        <p className="text-text-muted text-sm mb-10">
          Aggregate data across all coverage areas
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              label: "Est. Jewish Population",
              value: formatNumber(stats.totalEstimatedPopulation),
            },
            { label: "Synagogues", value: formatNumber(stats.totalSynagogues) },
            {
              label: "Kosher Establishments",
              value: formatNumber(stats.totalKosherEstablishments),
            },
            {
              label: "Community Centers",
              value: formatNumber(stats.totalJCCs),
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-bg-card border border-border rounded-xl p-5"
            >
              <p className="text-xs text-text-muted mb-1.5">{card.label}</p>
              <p className="font-display text-2xl font-bold text-accent-gold">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Top Metros */}
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              Top 10 Metros by CDI
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-text-muted">
                  <th className="text-left pb-2 font-normal">#</th>
                  <th className="text-left pb-2 font-normal">Metro</th>
                  <th className="text-right pb-2 font-normal">CDI</th>
                </tr>
              </thead>
              <tbody>
                {stats.topMetros.map((m) => (
                  <tr key={m.rank} className="border-t border-border/50">
                    <td className="py-2 text-text-muted">{m.rank}</td>
                    <td className="py-2 text-text-secondary">{m.name}</td>
                    <td className="py-2 text-right font-display font-bold text-accent-gold">
                      {m.cdi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top ZIPs */}
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              Top 10 ZIP Codes by CDI
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-text-muted">
                  <th className="text-left pb-2 font-normal">#</th>
                  <th className="text-left pb-2 font-normal">ZIP</th>
                  <th className="text-left pb-2 font-normal">Area</th>
                  <th className="text-right pb-2 font-normal">CDI</th>
                </tr>
              </thead>
              <tbody>
                {stats.topZIPs.map((z) => (
                  <tr key={z.rank} className="border-t border-border/50">
                    <td className="py-2 text-text-muted">{z.rank}</td>
                    <td className="py-2 text-text-secondary font-mono text-xs">
                      {z.zip}
                    </td>
                    <td className="py-2 text-text-secondary">{z.area}</td>
                    <td className="py-2 text-right font-display font-bold text-accent-gold">
                      {z.cdi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CDI Distribution */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">
            CDI Score Distribution
          </h2>
          <div className="flex items-end gap-3 h-40">
            {Object.entries(stats.cdiDistribution).map(([range, count]) => (
              <div
                key={range}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-text-muted">{count}</span>
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${(count / maxDist) * 120}px`,
                    background:
                      range === "81-100"
                        ? "#d4a853"
                        : range === "61-80"
                        ? "#c9a84c"
                        : range === "41-60"
                        ? "#4a9fd4"
                        : range === "21-40"
                        ? "#2a6db5"
                        : "#1e3a6e",
                  }}
                />
                <span className="text-[10px] text-text-muted mt-1">
                  {range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
