"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/shared/BrandLogo";
import Button from "@/components/shared/Button";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";

const navGroups = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/guides", label: "Tour Guides" },
    ],
  },
  {
    label: "Insights",
    items: [{ href: "/admin/analytics", label: "Analytics" }],
  },
  {
    label: "Website",
    items: [{ href: "/", label: "View Public Website" }],
  },
];

function getAdminIdentity() {
  const session = getAdminSession();
  const adminEmail = session?.email || "admin@mali2ipoh.test";
  const adminName = adminEmail
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    adminEmail,
    adminName: adminName || "Admin",
  };
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!getAdminSession()) {
      router.replace("/admin/login");
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [router]);

  const { adminEmail, adminName } = getAdminIdentity();

  function handleLogout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  if (!isReady) {
    return (
      <div className="admin-shell">
        <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-[#e7edf5] bg-white p-6 text-sm text-muted">
            Loading admin session...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="mx-auto grid min-h-screen max-w-[1680px] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col bg-[linear-gradient(180deg,#0f456d_0%,#166aa2_58%,#0f5f92_100%)] px-4 py-4 text-white sm:px-5 sm:py-5 xl:min-h-screen xl:px-6 xl:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <BrandLogo
                  href="/admin"
                  className="block"
                  imageClassName="max-w-[112px] brightness-[1.02] saturate-[1.02] sm:max-w-[124px]"
                />
                <p className="text-[15px] font-semibold sm:text-[17px]">Mali2Ipoh Admin Panel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white xl:hidden"
            >
              Menu
            </button>
          </div>

          <nav className={`${menuOpen ? "mt-5 grid" : "hidden"} gap-5 xl:mt-7 xl:grid xl:gap-7`}>
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[13px] font-medium text-white/55">{group.label}</p>
                <div className="mt-3 space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = item.href === "/"
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition sm:text-[15px] ${
                          isActive
                            ? "bg-white/12 font-semibold text-white"
                            : "text-white/82 hover:bg-white/8"
                        }`}
                      >
                        <span className="text-xs">◌</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-5 rounded-[22px] bg-[linear-gradient(180deg,#ff9b55_0%,#ff852f_100%)] p-3.5 text-white shadow-[0_18px_30px_rgba(0,0,0,0.14)] xl:mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(180deg,#0f456d_0%,#145d91_100%)] text-sm font-semibold text-white">
                {adminName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{adminName}</p>
                <p className="truncate text-xs text-white/85 sm:text-sm">{adminEmail}</p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="secondary"
              className="mt-3 w-full rounded-2xl border-white/20 bg-white/92 px-4 py-2.5 text-sm text-brand-deep hover:bg-white"
            >
              Logout
            </Button>
          </div>
        </aside>

        <main className="min-w-0 bg-[#edf4fa] p-2 sm:p-2.5 xl:p-2">
          <div className="h-full rounded-[22px] border border-[#d3e1eb] bg-[#f8fbfd] shadow-[0_18px_40px_rgba(24,83,121,0.08)] sm:rounded-[24px]">
            <div className="admin-density px-3 py-3 sm:px-4 sm:py-4 xl:px-6 xl:py-5">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
