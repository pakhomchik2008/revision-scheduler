"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import { LayoutDashboard, CalendarDays, BookOpen, BarChart3, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems: { href: string; icon: LucideIcon }[] = [
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/schedule", icon: CalendarDays },
  { href: "/exams", icon: BookOpen },
  { href: "/progress", icon: BarChart3 },
  { href: "/settings", icon: Settings },
];

export default function NavBar({ email }: { email: string }) {
  const path = usePathname();
  const { t } = useI18n();

  const labels: Record<string, string> = {
    "/dashboard": t.nav_dashboard,
    "/schedule": t.nav_schedule,
    "/exams": t.nav_exams,
    "/progress": t.nav_progress,
    "/settings": t.nav_settings,
  };

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden border-b border-slate-200 bg-white md:block" aria-label="Main navigation">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 font-semibold text-slate-900" aria-label="Revision Scheduler home">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
            Revision
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(({ href, icon: Icon }) => (
              <Link
                key={href} href={href}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  path?.startsWith(href) ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"
                }`}
                aria-current={path?.startsWith(href) ? "page" : undefined}
              >
                {labels[href]}
              </Link>
            ))}
            <div className="ml-2 mr-1">
              <LanguageSwitcher compact />
            </div>
            <form action="/auth/logout" method="post">
              <button className="ml-1 text-sm text-slate-500 hover:text-slate-900" type="submit">{t.nav_logout}</button>
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white md:hidden" aria-label="Mobile navigation">
        <div className="flex justify-around py-2">
          {navItems.map(({ href, icon: Icon }) => (
            <Link
              key={href} href={href}
              className={`flex flex-col items-center gap-0.5 flex-1 text-center text-[10px] leading-tight py-1 ${
                path?.startsWith(href) ? "text-primary font-semibold" : "text-slate-500"
              }`}
              aria-current={path?.startsWith(href) ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {labels[href]}
            </Link>
          ))}
        </div>
      </nav>

      <p className="sr-only">Signed in as {email}</p>
    </>
  );
}
