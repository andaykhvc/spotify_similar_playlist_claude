import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { SiteFooter } from "./site-footer";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-16 sm:px-8">
      <header className="flex h-16 items-center sm:h-20">
        <Link href="/" className="display flex items-center gap-2 text-lg leading-none tracking-[-0.02em]">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5 text-accent">
            <circle cx="7" cy="12" r="3" fill="currentColor" />
            <path d="M12 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".75" />
            <path d="M15.5 3.5a11.5 11.5 0 0 1 0 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".45" />
          </svg>
          Echo List
        </Link>
      </header>
      <main className="flex flex-col">
        <h1 className="display mt-6 text-[clamp(2.25rem,7vw,3.5rem)] leading-[1] tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-3 text-sm text-muted">Son güncelleme: {LEGAL.updatedAt}</p>
        <article className="legal mt-10">{children}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
