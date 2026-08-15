import Container from "@/components/shared/Container";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  const demoEmail = process.env.DEMO_ADMIN_EMAIL || "admin@mali2ipoh.test";
  const demoPassword = process.env.DEMO_ADMIN_PASSWORD || "change-this-for-local-demo";

  return (
    <div className="page-shell min-h-screen">
      <Container className="py-10 md:py-16">
        <div className="mx-auto max-w-xl">
          <AdminLoginForm demoEmail={demoEmail} demoPassword={demoPassword} />
        </div>
      </Container>
    </div>
  );
}
