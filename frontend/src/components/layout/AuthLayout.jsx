import BrandLogo from '@/components/layout/BrandLogo';
import AuthHero from '@/components/layout/AuthHero';

export default function AuthLayout({ title, subtitle, children, footer, heroTitle, heroSubtitle }) {
  return (
    <main className="flex w-full min-h-screen bg-[var(--color-background)]">
      <section className="w-full lg:w-1/2 flex flex-col justify-between p-6 md:p-12 bg-[var(--color-surface)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex-1 flex flex-col">
          <BrandLogo className="mb-12" />

          <div className="max-w-md mx-auto lg:mx-0 w-full flex-1">
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2 tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-base text-[var(--color-on-surface-variant)] mb-8">{subtitle}</p>
            )}
            {children}
          </div>
        </div>

        {footer && (
          <footer className="relative z-10 pt-8">
            {footer}
          </footer>
        )}
      </section>

      <AuthHero title={heroTitle} subtitle={heroSubtitle} />
    </main>
  );
}
