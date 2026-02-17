import Navbar from "@/components/ui/Navbar";
import ColorScale from "@/components/ui/ColorScale";
import { FILTERS, FILTER_GROUPS } from "@/data/filters";

const GROUPS_ORDER = ["religious", "education", "food", "community"];

export default function HowItWorksPage() {
  return (
    <main className="bg-bg-primary min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        {/* Title */}
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          How It Works
        </h1>
        <p className="text-text-muted text-sm mb-12">
          Methodology &amp; Data Sources
        </p>

        {/* Section 1: What is Shalom Atlas */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-accent-gold mb-3">
            What is Shalom Atlas?
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Shalom Atlas is a data visualization tool that maps Jewish community
            presence across the United States. By aggregating publicly available
            data on synagogues, Jewish schools, kosher establishments, community
            centers, and more, we create a comprehensive picture of where Jewish
            communities thrive.
          </p>
        </section>

        {/* Section 2: CDI */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-accent-gold mb-3">
            The Community Density Index
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            The CDI is a composite score from 0 to 100 that represents the
            density and diversity of Jewish community infrastructure in a given
            area. Higher scores indicate stronger community presence.
          </p>
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <ColorScale className="mb-2" />
            <div className="flex justify-between text-xs text-text-muted">
              <span>0 — Low Community Presence</span>
              <span>100 — High Community Presence</span>
            </div>
          </div>
        </section>

        {/* Section 3: Data Layers */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-accent-gold mb-4">
            Data Layers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GROUPS_ORDER.map((group) => {
              const filters = FILTERS.filter((f) => f.group === group);
              const weights = filters.map((f) => f.weight);
              const minW = Math.min(...weights);
              const maxW = Math.max(...weights);
              return (
                <div
                  key={group}
                  className="bg-bg-card border border-border rounded-xl p-5"
                >
                  <h3 className="text-sm font-semibold text-accent-gold uppercase tracking-wider mb-3">
                    {FILTER_GROUPS[group]}
                  </h3>
                  <p className="text-xs text-text-muted mb-3">
                    Weight: {minW}–{maxW}x
                  </p>
                  <ul className="space-y-1.5">
                    {filters.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: f.color }}
                        />
                        <span className="text-text-secondary">{f.label}</span>
                        <span className="text-text-muted text-xs ml-auto">
                          x{f.weight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: The Grid */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-accent-gold mb-3">
            The Grid
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Shalom Atlas uses Uber&apos;s H3 hexagonal grid system to divide the
            map into uniform cells. Hexagons are ideal for spatial analysis
            because they have consistent distances between cell centers and
            reduce edge effects compared to square grids.
          </p>
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-1">
                  Resolution 7
                </h4>
                <p className="text-xs text-text-muted">
                  ~5.16 km&sup2; per cell. Used at zoom levels 8 and below for
                  regional overview.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-1">
                  Resolution 8
                </h4>
                <p className="text-xs text-text-muted">
                  ~0.74 km&sup2; per cell. Used at zoom levels above 8 for
                  neighborhood detail.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Score Calculation */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-accent-gold mb-4">
            How the Score is Calculated
          </h2>
          <div className="space-y-3">
            {[
              "Count points of interest from each data layer that fall within each hex cell",
              "Multiply each count by its layer weight (e.g., Synagogues x2.5, Kosher Restaurants x1.3)",
              "Sum all weighted counts to produce a raw score",
              "Normalize against the 99th percentile across all cells",
              "Produce a final 0-100 CDI score (higher = more community presence)",
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent-gold/15 text-accent-gold text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Community Voting */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-accent-gold mb-3">
            Community Voting
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Shalom Atlas uses community voting to refine density scores across the map.
            Click any hex cell to vote on whether its score accurately reflects the area.
          </p>
          <div className="space-y-3">
            {[
              "Vote on Areas You Know — Click a hex cell and tell us if its score is accurate, too high, or too low.",
              "Earn Points — Get +2 for being the first voter on a cell, +1 for any vote. Lose -2 if you change your mind. Max 500 points per day.",
              "Build Trust — Your trust level starts at 1.0x and increases as your votes align with consensus. Higher trust = more influence.",
              "Voting Periods — Votes lock every 12 hours (6am & 6pm UTC). Scores are adjusted based on community consensus.",
              "Climb the Leaderboard — Top voters are ranked. Active contributors shape the most accurate map possible.",
              "Link Your Wallet — Optionally connect a Solana wallet. Active contributors may be recognized in the future.",
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent-gold/15 text-accent-gold text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Data & Privacy */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-accent-gold mb-3">
            Data &amp; Privacy
          </h2>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-2">
              <span className="text-accent-gold">&#x2022;</span>
              All data comes from publicly available sources (Google Places API,
              public directories)
            </li>
            <li className="flex gap-2">
              <span className="text-accent-gold">&#x2022;</span>
              No personal information is collected, stored, or displayed
            </li>
            <li className="flex gap-2">
              <span className="text-accent-gold">&#x2022;</span>
              Data is aggregated at the hex cell level — individual addresses are
              never shown
            </li>
            <li className="flex gap-2">
              <span className="text-accent-gold">&#x2022;</span>
              Population estimates come from the Brandeis AJPP and US Census
            </li>
          </ul>
        </section>

        {/* Section 7: Limitations */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-accent-gold mb-3">
            Limitations
          </h2>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-2">
              <span className="text-text-muted">&#x2022;</span>
              Google Places data may not capture every establishment, especially
              smaller or newer ones
            </li>
            <li className="flex gap-2">
              <span className="text-text-muted">&#x2022;</span>
              The CDI is a proxy for community infrastructure, not a census of
              Jewish individuals
            </li>
            <li className="flex gap-2">
              <span className="text-text-muted">&#x2022;</span>
              Rural areas with small but active communities may be
              underrepresented
            </li>
            <li className="flex gap-2">
              <span className="text-text-muted">&#x2022;</span>
              Weights are configurable defaults and may not perfectly reflect
              every community&apos;s priorities
            </li>
            <li className="flex gap-2">
              <span className="text-text-muted">&#x2022;</span>
              Data is updated periodically and may not reflect very recent
              changes
            </li>
          </ul>
        </section>

        {/* Section 8: Disclaimer */}
        <div className="border border-border rounded-xl p-5 bg-bg-card/50">
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Disclaimer
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Shalom Atlas is an independent data visualization project for
            educational and research purposes. It is not affiliated with any
            religious organization, government agency, or community group. The
            Community Density Index is a derived statistical measure and should
            not be used as the sole basis for any decision. Data accuracy depends
            on the completeness of public source data. We welcome corrections
            and feedback.
          </p>
        </div>
      </div>
    </main>
  );
}
