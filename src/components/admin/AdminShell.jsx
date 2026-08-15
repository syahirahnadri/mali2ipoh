"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      <div className="mx-auto grid min-h-screen max-w-[1800px] lg:grid-cols-[410px_minmax(0,1fr)]">
        <aside className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#2a277c_0%,#25226f_100%)] px-8 py-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-brand-deep shadow-[0_10px_24px_rgba(255,205,31,0.25)]">
                ✦
              </div>
              <div>
                <p className="text-[18px] font-semibold">Mali2Ipoh Admin Panel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white lg:hidden"
            >
              Menu
            </button>
          </div>

          <nav className={`${menuOpen ? "mt-8 grid" : "hidden"} gap-8 lg:mt-8 lg:grid`}>
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[15px] font-medium text-white/55">{group.label}</p>
                <div className="mt-3 space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = item.href === "/"
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[17px] transition ${
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

          <div className="mt-auto rounded-[24px] bg-brand p-4 text-brand-deep shadow-[0_18px_30px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#2d2a82_0%,#23206a_100%)] text-base font-semibold text-white">
                {adminName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[18px] font-semibold">{adminName}</p>
                <p className="truncate text-sm opacity-80">{adminEmail}</p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="secondary"
              className="mt-4 w-full rounded-2xl border-brand-deep/10 bg-white/85 text-brand-deep hover:bg-white"
            >
              Logout
            </Button>
          </div>
        </aside>

        <main className="bg-[#f3f3fa] p-3 lg:p-2">
          <div className="h-full rounded-[28px] border border-[#d9deef] bg-[#f7f7fc] shadow-[0_18px_40px_rgba(43,39,124,0.08)]">
            <div className="px-4 py-4 lg:px-8 lg:py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
