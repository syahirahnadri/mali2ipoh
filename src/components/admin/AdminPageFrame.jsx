export default function AdminPageFrame({ eyebrow, title, description, children }) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="admin-highlight relative overflow-hidden rounded-[24px] p-4 sm:rounded-[26px] sm:p-5 md:rounded-[30px] md:p-6">
        <div className="absolute right-5 top-5 hidden h-24 w-24 rounded-full bg-white/30 blur-2xl md:block" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <p className="eyebrow text-xs font-semibold text-[#5f7d98]">{eyebrow}</p>
            <span className="admin-chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f7d98]">
              Travel operations
            </span>
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-2xl font-semibold tracking-[-0.03em] text-ink sm:text-[2rem] md:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted md:text-[15px]">
            {description}
          </p>
        </div>
      </section>
      {children}
    </div>
  );
}
