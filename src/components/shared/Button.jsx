import Link from "next/link";

const variantClasses = {
  primary:
    "rounded-2xl bg-brand !text-white shadow-[0_16px_32px_rgba(21,110,168,0.24)] hover:bg-[#0f6294]",
  secondary:
    "rounded-2xl border border-line bg-white/90 text-ink hover:border-brand/50 hover:bg-surface",
};

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}) {
  const classes = `inline-flex items-center justify-center px-5 py-3 text-sm font-semibold transition-all duration-200 ${disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5"} ${variantClasses[variant]} ${className}`.trim();

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
