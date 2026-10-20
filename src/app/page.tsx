import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getConfig();

  return (
    <>
      <SiteHeader />
      <main className="relative flex flex-1 flex-col">
        <section className="relative flex min-h-[calc(100vh-4.5rem)] flex-1 flex-col justify-end overflow-hidden px-5 pb-14 pt-6 sm:px-10 sm:pb-16 sm:justify-center">
          <div className="absolute inset-0">
            <Image
              src="/og-2010.png"
              alt="RIO — Chào mừng Ngày Phụ nữ Việt Nam 20/10"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_30%] sm:object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fff5f7]/95 via-[#fff5f7]/72 to-[#fff5f7]/25 sm:via-[#fff5f7]/55 sm:to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#fff5f7]/90 to-transparent sm:hidden" />
          </div>

          <div className="relative z-10 max-w-xl animate-rise">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--rose-deep)]">
              Office party · Gift exchange
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-[2.6rem] leading-[1.08] text-[var(--ink)] sm:text-6xl">
              {config.title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
              {config.welcomeText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/guess"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--rose-deep)] px-7 text-base font-medium text-white transition hover:bg-[var(--rose)]"
              >
                Đoán người
              </Link>
              <Link
                href="/gifts"
                className="inline-flex h-12 items-center justify-center rounded-full border border-rose-300/80 bg-white/55 px-7 text-base font-medium text-[var(--ink)] backdrop-blur transition hover:bg-white/80"
              >
                Quà bí mật
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
