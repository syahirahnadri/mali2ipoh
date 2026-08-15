import Container from "@/components/shared/Container";
import BrandLogo from "@/components/shared/BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-line/70 bg-white/70 py-8 backdrop-blur">
      <Container className="flex flex-col gap-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <BrandLogo href="/" className="block" imageClassName="max-w-[150px]" />
          <p>
            Local Ipoh trip planning for overseas travellers, from arrival pickup
            to curated private touring.
          </p>
        </div>
        <p>POC booking flow and admin operations live in this browser session.</p>
      </Container>
    </footer>
  );
}
