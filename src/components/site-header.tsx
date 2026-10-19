import Link from "next/link";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <Link href="/" className="group flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)] transition group-hover:text-[var(--rose-deep)] sm:text-2xl">
          20/10
        </span>
        {!compact && (
          <span className="hidden text-sm text-[var(--ink-soft)] sm:inline">
            Phụ nữ Việt Nam
          </span>
        )}
      </Link>
      <nav className="flex items-center gap-1 text-sm sm:gap-2">
        <Link
          href="/guess"
          className="rounded-full px-3 py-1.5 text-[var(--ink-soft)] transition hover:bg-white/50 hover:text-[var(--ink)]"
        >
          Đoán người
        </Link>
        <Link
          href="/gifts"
          className="rounded-full px-3 py-1.5 text-[var(--ink-soft)] transition hover:bg-white/50 hover:text-[var(--ink)]"
        >
          Quà bí mật
        </Link>
        <Link
          href="/admin"
          className="rounded-full px-3 py-1.5 text-[var(--ink-muted)] transition hover:bg-white/40 hover:text-[var(--ink)]"
        >
          Admin
        </Link>
      </nav>
    </header>
  );
}
