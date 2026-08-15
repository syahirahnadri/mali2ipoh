import Button from "@/components/shared/Button";
import BrandLogo from "@/components/shared/BrandLogo";
import Container from "@/components/shared/Container";

const navItems = [
  { href: "/#discover", label: "Discover" },
  { href: "/#journey", label: "Journey" },
  { href: "/#stays", label: "Stays" },
  { href: "/#offers", label: "Offers" },
];

export default function Header() {
  return (
    <header className="pt-4 md:pt-6">
      <Container className="max-w-[100rem] px-3 sm:px-4 lg:px-5">
        <div className="mx-auto max-w-[96rem] rounded-[24px] bg-white/90 p-2 shadow-[0_28px_80px_rgba(21,83,122,0.12)] ring-1 ring-white/70 backdrop-blur sm:rounded-[32px] sm:p-3 md:rounded-[40px] md:p-4">
          <div className="rounded-[22px] bg-white p-4 sm:rounded-[28px] md:rounded-[34px] md:p-5">
            <div className="flex flex-col gap-4 border-b border-[#edf2f7] pb-3 md:grid md:grid-cols-[88px_1fr_auto] md:items-center md:gap-6 lg:grid-cols-[96px_1fr_auto]">
              <BrandLogo
                href="/"
                className="block"
                imageClassName="max-w-[66px] sm:max-w-[72px] md:max-w-[88px] lg:max-w-[96px]"
                priority
              />

              <nav className="hidden items-center justify-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted md:flex lg:gap-7">
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

              <Button
                href="/trip-builder?preferredTier=SMART_COMFORT"
                className="w-full justify-center rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] text-white sm:w-auto md:min-w-[148px]"
              >
                Book Trip
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
