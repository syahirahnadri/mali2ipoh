export default function AdminPageFrame({ eyebrow, title, description, children }) {
  return (
    <div className="space-y-6">
      <section className="admin-highlight relative overflow-hidden rounded-[34px] p-6 md:p-8">
        <div className="absolute right-5 top-5 hidden h-24 w-24 rounded-full bg-white/30 blur-2xl md:block" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow text-xs font-semibold text-[#5f7d98]">{eyebrow}</p>
            <span className="admin-chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f7d98]">
              Travel operations
            </span>
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-semibold tracking-[-0.03em] text-ink md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
            {description}
          </p>
        </div>
      </section>
      {children}
    </div>
  );
}
