import Container from "@/components/shared/Container";
import BrandLogo from "@/components/shared/BrandLogo";

const footerLinks = [
  { href: "#discover", label: "Discover" },
  { href: "#journey", label: "Journey" },
  { href: "#stays", label: "Stays" },
  { href: "#offers", label: "Offers" },
];

export default function Footer() {
  return (
    <footer className="pb-8 pt-3 sm:pb-10">
      <Container className="max-w-[100rem] px-3 sm:px-4 lg:px-5">
        <div className="mx-auto max-w-[96rem] rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(245,250,254,0.94))] px-5 py-5 shadow-[0_22px_60px_rgba(21,83,122,0.08)] backdrop-blur sm:px-6 sm:py-6">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <BrandLogo href="/" className="block shrink-0" imageClassName="max-w-[82px] sm:max-w-[92px]" />
                <div className="max-w-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5c7c97]">
                    Mali2Ipoh travel design
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted sm:text-base">
                    Local Ipoh trip planning for overseas travellers, from arrival pickup to
                    curated private touring with a calmer, guided booking flow.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#68839a] sm:gap-5">
                {footerLinks.map((link) => (
                  <a key={link.label} href={link.href} className="transition hover:text-ink">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#dde8f1] bg-white/72 px-4 py-4 text-sm text-muted">
              <p className="font-semibold text-ink">POC booking flow and admin operations</p>
              <p className="mt-2 leading-6">
                Live in this browser session with local data, curated stays, and Smart Comfort trip planning.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
