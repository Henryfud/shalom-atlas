export default function RequestDataSection() {
  return (
    <section className="bg-bg-primary px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-text-primary text-center mb-2">
          Request Data
        </h2>
        <p className="text-text-secondary text-center mb-10 text-[15px]">
          Help us expand our coverage by requesting new cities or data sources
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Request a City */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏙</span>
              <h3 className="text-lg font-semibold text-text-primary">
                Request a City
              </h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Don&apos;t see your city? Let us know.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Boca Raton"
                className="flex-1 px-3 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold-dim focus:outline-none transition-colors"
              />
              <button className="px-5 py-2.5 bg-accent-gold hover:bg-accent-gold/90 text-bg-primary font-semibold rounded-lg text-sm transition-colors cursor-pointer">
                Submit
              </button>
            </div>
          </div>

          {/* Request a Name */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✨</span>
              <h3 className="text-lg font-semibold text-text-primary">
                Request a Name
              </h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Have a name we should include?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Goldstein"
                className="flex-1 px-3 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold-dim focus:outline-none transition-colors"
              />
              <button className="px-5 py-2.5 bg-accent-gold hover:bg-accent-gold/90 text-bg-primary font-semibold rounded-lg text-sm transition-colors cursor-pointer">
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-text-muted text-center leading-relaxed max-w-2xl mx-auto">
            This site displays derived statistical data for educational and
            research purposes only. We do not store or display personal
            information, last names, addresses, or precise coordinates. See our{" "}
            <a
              href="/how-it-works"
              className="text-accent-gold hover:underline"
            >
              How It Works
            </a>{" "}
            page for more info.
          </p>
        </div>
      </div>
    </section>
  );
}
