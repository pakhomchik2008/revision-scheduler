"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function NavBar({ email }: { email: string }) {
  const path = usePathname();
  const { t } = useI18n();

  const links = [
    { href: "/dashboard", label: t.nav_dashboard },
    { href: "/schedule", label: t.nav_schedule },
    { href: "/exams", label: t.nav_exams },
    { href: "/progress", label: t.nav_progress },
    { href: "/settings", label: t.nav_settings },
  ];

  return (
    <>
      <nav className="hidden border-b border-slate-200 bg-white md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-semibold text-slate-900">📚 Revision</Link>
          <div className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href} href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  path?.startsWith(l.href) ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >{l.label}</Link>
            ))}
            <div className="ml-2 mr-1">
              <LanguageSwitcher compact />
            </div>
            <form action="/auth/logout" method="post">
              <button className="ml-1 text-sm text-slate-500 hover:text-slate-900">{t.nav_logout}</button>
            </form>
          </div>
        </div>
      </nav>
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white md:hidden">
        <div className="flex justify-around py-2">
          {links.map((l) => (
            <Link
              key={l.href} href={l.href}
              className={`flex-1 text-center text-xs ${
                path?.startsWith(l.href) ? "text-primary font-semibold" : "text-slate-500"
              }`}
            >{l.label}</Link>
          ))}
        </div>
      </nav>
      <p className="sr-only">Signed in as {email}</p>
    </>
  );
}
