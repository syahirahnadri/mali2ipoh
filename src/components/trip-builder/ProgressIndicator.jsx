const defaultSteps = [
  { key: "basics", label: "Trip basics" },
  { key: "attractions", label: "Attractions" },
  { key: "recommendation", label: "Recommendation" },
  { key: "hotel", label: "Hotel" },
  { key: "arrival", label: "Arrival" },
  { key: "review", label: "Review" },
  { key: "traveller", label: "Traveller" },
];

export default function ProgressIndicator({ currentStep }) {
  const currentIndex = defaultSteps.findIndex((step) => step.key === currentStep);

  return (
    <div className="rounded-[1.75rem] border border-line bg-white/75 p-4 md:p-5">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        {defaultSteps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={step.key}
              className={`rounded-2xl border px-3 py-3 text-sm transition ${
                isCurrent
                  ? "border-brand bg-brand text-white"
                  : isComplete
                    ? "border-accent/30 bg-accent/10 text-ink"
                    : "border-line bg-surface text-muted"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.18em]">Step {index + 1}</p>
              <p className="mt-1 font-semibold">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
