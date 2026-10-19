export function Atmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--wash)]" />
      <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,113,133,0.35),transparent_70%)] blur-2xl animate-drift" />
      <div className="absolute -right-16 top-1/4 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(253,164,175,0.45),transparent_68%)] blur-2xl animate-drift-slow" />
      <div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.18),transparent_70%)] blur-3xl animate-float" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
