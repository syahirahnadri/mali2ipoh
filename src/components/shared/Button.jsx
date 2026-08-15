import Link from "next/link";

const variantClasses = {
  primary:
    "rounded-2xl bg-brand text-brand-deep shadow-[0_16px_32px_rgba(255,205,31,0.3)] hover:bg-[#f3bf00]",
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
