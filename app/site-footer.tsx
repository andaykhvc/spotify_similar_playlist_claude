import Link from "next/link";
import { messages, type Lang } from "@/lib/i18n";

/** Attribution the Spotify and Last.fm terms ask for, plus links to the legal pages. */
export function SiteFooter({ lang }: { lang: Lang }) {
  const t = messages[lang];
  return (
    <footer className="mt-20 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted">
      <p className="max-w-[60ch] text-pretty">
        {t.footerSource}{" "}
        <a href="https://open.spotify.com" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
          Spotify
        </a>
        {t.footerSimilarity}
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <a href="https://www.last.fm" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
          powered by AudioScrobbler
        </a>
        <Link href={t.privacyHref} className="underline underline-offset-2 hover:text-ink">
          {t.privacy}
        </Link>
        <Link href={t.termsHref} className="underline underline-offset-2 hover:text-ink">
          {t.terms}
        </Link>
      </div>
    </footer>
  );
}
