import "./globals.css";

export const metadata = {
  title: "Mali2Ipoh Smart Trip Builder",
  description:
    "Phase 1 foundation for the Mali2Ipoh Smart Trip Builder proof of concept.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full bg-sand text-ink antialiased">{children}</body>
    </html>
  );
}
