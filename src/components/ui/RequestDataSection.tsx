"use client";

import { useState } from "react";

function RequestCard({
  title,
  description,
  placeholder,
  type,
  multiline,
}: {
  title: string;
  description: string;
  placeholder: string;
  type: string;
  multiline?: boolean;
}) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit() {
    if (!value.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setStatus("sent");
      setValue("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted mb-4">{description}</p>
      <div className={multiline ? "flex flex-col gap-2" : "flex gap-2"}>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold-dim focus:outline-none transition-colors resize-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            maxLength={500}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 px-3 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold-dim focus:outline-none transition-colors"
          />
        )}
        <button
          onClick={handleSubmit}
          disabled={status === "sending" || !value.trim()}
          className={`px-5 py-2.5 font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            status === "sent"
              ? "bg-green-600 text-white"
              : status === "error"
              ? "bg-red-500 text-white"
              : "bg-accent-gold hover:bg-accent-gold/90 text-bg-primary"
          }`}
        >
          {status === "sending"
            ? "Sending..."
            : status === "sent"
            ? "Sent!"
            : status === "error"
            ? "Failed"
            : "Submit"}
        </button>
      </div>
      {status === "error" && errorMsg && (
        <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
      )}
    </div>
  );
}

export default function RequestDataSection() {
  return (
    <section className="bg-bg-primary px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-text-primary text-center mb-2">
          Request Data
        </h2>
        <p className="text-text-secondary text-center mb-10 text-[15px]">
          Help us expand our coverage by requesting new cities, data sources, or sharing ideas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <RequestCard
            title="Request a City"
            description="Don't see your city? Let us know."
            placeholder="e.g. Boca Raton"
            type="city"
          />
          <RequestCard
            title="Request a Name"
            description="Have a name we should include?"
            placeholder="e.g. Goldstein"
            type="name"
          />
          <RequestCard
            title="Share an Idea"
            description="Feature requests, data sources, or feedback."
            placeholder="e.g. Add synagogue density overlay"
            type="idea"
            multiline
          />
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
