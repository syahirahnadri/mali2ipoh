import Container from "@/components/shared/Container";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";

export default function TripBuilderPageShell({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div className="page-shell">
      <Header />
      <main className="pb-20">
        <Container className="pt-8 md:pt-12">
          <section className="soft-card rounded-[2rem] p-6 md:p-8">
            <p className="eyebrow text-xs font-semibold text-brand-deep">{eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted md:text-lg">
              {description}
            </p>
          </section>
        </Container>
        <Container className="pt-6">{children}</Container>
      </main>
      <Footer />
    </div>
  );
}
