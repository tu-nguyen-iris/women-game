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
        <section className="relative flex min-h-[calc(100vh-4.5rem)] flex-1 flex-col justify-center px-5 pb-16 pt-6 sm:px-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block">
            <div className="absolute inset-6 overflow-hidden rounded-[2.5rem]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.55),transparent_45%),linear-gradient(145deg,#fda4af_0%,#be123c_55%,#881337_100%)]" />
              <div className="absolute -left-10 top-16 h-40 w-40 rounded-full bg-white/25 blur-2xl animate-float" />
              <div className="absolute bottom-20 right-10 h-28 w-28 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm animate-drift" />
              <div className="absolute inset-0 flex items-end justify-center pb-14">
                <p className="font-[family-name:var(--font-display)] text-6xl text-white/90 xl:text-7xl">
                  20 · 10
                </p>
              </div>
            </div>
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
