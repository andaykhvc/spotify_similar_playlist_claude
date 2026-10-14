"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GenerateResult, SuggestedTrack } from "@/lib/generate";

type User = { id: string; name: string };
type Playlist = {
  id: string;
  name: string;
  image: string | null;
  total: number | null;
  owner: string;
  readable: boolean;
};

const LOGIN_ERRORS: Record<string, string> = {
  denied: "Spotify izni verilmedi.",
  state: "Giriş yarıda kaldı, tekrar dene.",
  spotify: "Spotify girişi başarısız oldu.",
  login:
    "Giriş başarısız. App development mode'daysa hesabının Spotify Dashboard → User Management'a eklenmiş olması gerekiyor.",
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? "Bir şeyler ters gitti."), { auth: !!data.auth });
  return data as T;
}

export function SimilarApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loginError, setLoginError] = useState<string | null>(null);
  // Kept in a ref so the error survives StrictMode re-running the effect after the URL is cleaned.
  const errorParam = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (errorParam.current === undefined) {
      errorParam.current = new URLSearchParams(window.location.search).get("error");
      if (errorParam.current) window.history.replaceState(null, "", "/");
    }
    const err = errorParam.current;
    api<{ user: User | null }>("/api/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoginError(err ? (LOGIN_ERRORS[err] ?? LOGIN_ERRORS.spotify) : null));
  }, []);

  if (user === undefined) return <Shell><p className="text-muted">Yükleniyor…</p></Shell>;
  if (!user) return <Shell><Landing error={loginError} /></Shell>;
  return (
    <Shell user={user} onLogout={() => setUser(null)}>
      <Generator onAuthLost={() => setUser(null)} />
    </Shell>
  );
}

function Shell({ user, onLogout, children }: { user?: User; onLogout?: () => void; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-10 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold tracking-tight">
          <span className="text-accent">●</span> Benzer Playlist
        </span>
        {user && (
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="truncate">{user.name}</span>
            <button
              className="rounded-full border border-line px-3 py-1 transition-colors hover:border-foreground hover:text-foreground"
              onClick={async () => {
                await api("/api/auth/logout", { method: "POST" });
                onLogout?.();
              }}
            >
              Çıkış
            </button>
          </div>
        )}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

function Landing({ error }: { error: string | null }) {
  return (
    <section className="flex flex-1 flex-col justify-center gap-6 pb-24">
      <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
        Bir playlist seç, benzerini çıkaralım.
      </h1>
      <p className="max-w-lg text-muted text-pretty">
        Spotify &quot;benzer playlist&quot; özelliğini kaldırdı. Bu araç playlist&apos;indeki şarkılara Last.fm üzerinden
        benzeyenleri bulur, sen beğendiklerini seçersin, yeni playlist hesabına kaydedilir.
      </p>
      {error && <p className="max-w-lg rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm">{error}</p>}
      <a
        href="/api/auth/login"
        className="w-fit rounded-full bg-accent px-6 py-3 font-semibold text-black transition-transform active:scale-[0.97]"
      >
        Spotify ile bağlan
      </a>
    </section>
  );
}

type Phase =
  | { kind: "pick" }
  | { kind: "loading" }
  | { kind: "results"; result: GenerateResult }
  | { kind: "saved"; url: string; name: string; count: number };

function Generator({ onAuthLost }: { onAuthLost: () => void }) {
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const [link, setLink] = useState("");
  const [size, setSize] = useState(30);
  const [phase, setPhase] = useState<Phase>({ kind: "pick" });
  const [error, setError] = useState<string | null>(null);

  const fail = (e: unknown) => {
    const err = e as Error & { auth?: boolean };
    if (err.auth) onAuthLost();
    setError(err.message);
  };

  useEffect(() => {
    api<{ playlists: Playlist[] }>("/api/playlists")
      .then((d) => setPlaylists(d.playlists))
      .catch(fail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate(playlist: string) {
    setError(null);
    setPhase({ kind: "loading" });
    try {
      const result = await api<GenerateResult>("/api/similar", {
        method: "POST",
        body: JSON.stringify({ playlist, size }),
      });
      if (!result.tracks.length) {
        setError("Benzer şarkı bulunamadı. Daha kalabalık bir playlist dene.");
        setPhase({ kind: "pick" });
        return;
      }
      setPhase({ kind: "results", result });
    } catch (e) {
      fail(e);
      setPhase({ kind: "pick" });
    }
  }

  if (phase.kind === "loading") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-24 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        <p>Benzer şarkılar aranıyor…</p>
        <p className="text-sm text-muted">Playlist büyüklüğüne göre 10–30 saniye sürebilir.</p>
      </div>
    );
  }

  if (phase.kind === "results") {
    return (
      <Results
        result={phase.result}
        onBack={() => setPhase({ kind: "pick" })}
        onSaved={(url, name, count) => setPhase({ kind: "saved", url, name, count })}
        onError={fail}
        error={error}
      />
    );
  }

  if (phase.kind === "saved") {
    return (
      <section className="flex flex-1 flex-col items-start justify-center gap-4 pb-24">
        <h2 className="text-3xl font-semibold tracking-tight">Kaydedildi.</h2>
        <p className="text-muted">
          &quot;{phase.name}&quot; — {phase.count} şarkı, gizli playlist olarak hesabında.
        </p>
        <div className="flex gap-3">
          <a href={phase.url} target="_blank" rel="noreferrer" className="rounded-full bg-accent px-5 py-2.5 font-semibold text-black">
            Spotify&apos;da aç
          </a>
          <button className="rounded-full border border-line px-5 py-2.5" onClick={() => setPhase({ kind: "pick" })}>
            Bir tane daha
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Hangi playlist&apos;in benzerini istiyorsun?</h1>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (link.trim()) generate(link.trim());
          }}
        >
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Playlist linki yapıştır (open.spotify.com/playlist/…)"
            className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-3 outline-none placeholder:text-muted focus:border-accent"
          />
          <button
            disabled={!link.trim()}
            className="rounded-full bg-accent px-6 py-3 font-semibold text-black transition-transform active:scale-[0.97] disabled:opacity-40"
          >
            Benzerini oluştur
          </button>
        </form>
        <label className="flex items-center gap-4 text-sm text-muted">
          Şarkı sayısı
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-40 accent-[var(--accent)]"
          />
          <span className="w-8 tabular-nums text-foreground">{size}</span>
        </label>
        {error && <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm">{error}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted">ya da playlist&apos;lerinden birini seç</h2>
        {playlists === null ? (
          <p className="text-sm text-muted">Playlist&apos;ler yükleniyor…</p>
        ) : playlists.length === 0 ? (
          <p className="text-sm text-muted">Hiç playlist&apos;in yok.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {playlists.map((p) => (
              <li key={p.id}>
                <button
                  disabled={!p.readable}
                  title={p.readable ? undefined : "Spotify sadece sahibi olduğun playlist'lerin şarkılarını okutuyor"}
                  onClick={() => generate(p.id)}
                  className="group flex w-full flex-col gap-2 rounded-xl p-2 text-left transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
                >
                  <Cover src={p.image} className="aspect-square w-full rounded-lg" />
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <span className="truncate text-xs text-muted">
                    {p.total !== null ? `${p.total} şarkı · ` : ""}
                    {p.owner}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Results({
  result,
  onBack,
  onSaved,
  onError,
  error,
}: {
  result: GenerateResult;
  onBack: () => void;
  onSaved: (url: string, name: string, count: number) => void;
  onError: (e: unknown) => void;
  error: string | null;
}) {
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [name, setName] = useState(`${result.source.name} — Benzer`);
  const [saving, setSaving] = useState(false);
  const kept = useMemo(() => result.tracks.filter((t) => !removed.has(t.uri)), [result.tracks, removed]);

  async function save() {
    setSaving(true);
    try {
      const pl = await api<{ url: string }>("/api/save", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: `"${result.source.name}" playlist'ine benzer şarkılar.`,
          uris: kept.map((t) => t.uri),
        }),
      });
      onSaved(pl.url, name, kept.length);
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <button onClick={onBack} className="w-fit text-sm text-muted hover:text-foreground">
          ← Geri
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">&quot;{result.source.name}&quot; benzeri</h1>
        <p className="text-sm text-muted">
          {result.source.trackCount} şarkıdan {result.stats.seeds} tanesi tohum olarak kullanıldı · {kept.length} öneri
        </p>
      </div>

      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 border-b border-line bg-background/90 px-4 py-3 backdrop-blur sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-2.5 outline-none focus:border-accent"
        />
        <button
          onClick={save}
          disabled={saving || !kept.length || !name.trim()}
          className="rounded-full bg-accent px-6 py-2.5 font-semibold text-black transition-transform active:scale-[0.97] disabled:opacity-40"
        >
          {saving ? "Kaydediliyor…" : `Spotify'a kaydet (${kept.length})`}
        </button>
      </div>
      {error && <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm">{error}</p>}

      <ol className="flex flex-col">
        {result.tracks.map((t, i) => (
          <TrackRow
            key={t.uri}
            index={i + 1}
            track={t}
            removed={removed.has(t.uri)}
            onToggle={() =>
              setRemoved((prev) => {
                const next = new Set(prev);
                if (next.has(t.uri)) next.delete(t.uri);
                else next.add(t.uri);
                return next;
              })
            }
          />
        ))}
      </ol>
    </section>
  );
}

function TrackRow({
  index,
  track,
  removed,
  onToggle,
}: {
  index: number;
  track: SuggestedTrack;
  removed: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-opacity hover:bg-surface ${removed ? "opacity-35" : ""}`}
    >
      <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted">{index}</span>
      <Cover src={track.image} className="h-11 w-11 shrink-0 rounded" />
      <div className="min-w-0 flex-1">
        <a
          href={`https://open.spotify.com/track/${track.id}`}
          target="_blank"
          rel="noreferrer"
          className={`block truncate font-medium hover:underline ${removed ? "line-through" : ""}`}
        >
          {track.name}
        </a>
        <p className="truncate text-sm text-muted">
          {track.artists.join(", ")}
          {track.because.length > 0 && <span className="hidden sm:inline"> · benziyor: {track.because.join(", ")}</span>}
        </p>
      </div>
      <button
        onClick={onToggle}
        aria-label={removed ? "Geri ekle" : "Çıkar"}
        className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-foreground hover:text-foreground"
      >
        {removed ? "Geri al" : "Çıkar"}
      </button>
    </li>
  );
}

function Cover({ src, className }: { src: string | null; className: string }) {
  if (!src) return <div className={`${className} bg-surface`} />;
  // Spotify CDN images are already sized; next/image optimisation adds nothing here.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className={`${className} object-cover bg-surface`} />;
}
