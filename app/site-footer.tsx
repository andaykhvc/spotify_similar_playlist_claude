import Link from "next/link";

/** Attribution the Spotify and Last.fm terms ask for, plus links to the legal pages. */
export function SiteFooter() {
  return (
    <footer className="mt-20 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted">
      <p className="max-w-[60ch] text-pretty">
        Şarkı bilgileri{" "}
        <a href="https://open.spotify.com" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
          Spotify
        </a>
        &apos;dan, benzerlik verisi Last.fm&apos;den gelir. Echo List, Spotify veya Last.fm ile bağlantılı değildir ve
        onlar tarafından onaylanmamıştır.
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <a href="https://www.last.fm" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
          powered by AudioScrobbler
        </a>
        <Link href="/gizlilik" className="underline underline-offset-2 hover:text-ink">
          Gizlilik ve KVKK
        </Link>
        <Link href="/kosullar" className="underline underline-offset-2 hover:text-ink">
          Kullanım koşulları
        </Link>
      </div>
    </footer>
  );
}
