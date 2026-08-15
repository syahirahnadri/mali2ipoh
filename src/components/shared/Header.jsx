import Button from "@/components/shared/Button";
import BrandLogo from "@/components/shared/BrandLogo";
import Container from "@/components/shared/Container";

const navItems = [
  { href: "#explore-ipoh", label: "Explore Ipoh" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#about-us", label: "About Us" },
  { href: "#help", label: "Help" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <Container className="flex min-h-20 items-center justify-between gap-4">
        <BrandLogo href="/" className="block" imageClassName="max-w-[140px] sm:max-w-[160px]" priority />

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="rounded-2xl border border-line bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            EN
          </span>
          <Button href="/trip-builder">Build My Trip</Button>
        </div>
      </Container>
    </header>
  );
}
