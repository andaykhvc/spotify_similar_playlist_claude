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
  fullAccess: boolean;
};
type SearchTrack = { uri: string; id: string; title: string; artists: string[]; image: string | null };

/** What the server needs to generate: a playlist link/ID or a handful of picked songs. */
type GenerateInput = { playlist: string } | { seeds: SearchTrack[] };

const LOGIN_ERRORS: Record<string, string> = {
  denied: "Spotify izni verilmedi.",
  state: "Giriş yarıda kaldı, tekrar dene.",
  spotify: "Spotify girişi başarısız oldu.",
  login:
    "Giriş başarısız. App development mode'daysa hesabının Spotify Dashboard → User Management'a eklenmiş olması gerekiyor.",
};

// Results survive the Spotify login round-trip so an anonymous user can save what they just generated.
const PENDING_KEY = "pending-result";
type Pending = { result: GenerateResult; removed: string[]; name: string };

function readPending(): Pending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? "Bir şeyler ters gitti."), { auth: !!data.auth });
  return data as T;
}

type Phase =
  | { kind: "pick" }
  | { kind: "loading" }
  | { kind: "results"; result: GenerateResult; removed?: string[]; name?: string }
  | { kind: "saved"; url: string; name: string; count: number };

export function SimilarApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>({ kind: "pick" });
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState(30);
  // Kept in a ref so the error survives StrictMode re-running the effect after the URL is cleaned.
  const errorParam = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (errorParam.current === undefined) {
      errorParam.current = new URLSearchParams(window.location.search).get("error");
      if (errorParam.current) window.history.replaceState(null, "", "/");
    }
    const err = errorParam.current;
    api<{ user: User | null }>("/api/me")
      .then((d) => {
        setUser(d.user);
        const pending = readPending();
        if (pending) setPhase({ kind: "results", ...pending });
      })
      .catch(() => setUser(null))
      .finally(() => setError(err ? (LOGIN_ERRORS[err] ?? LOGIN_ERRORS.spotify) : null));
  }, []);

  const fail = (e: unknown) => {
    const err = e as Error & { auth?: boolean };
    if (err.auth) setUser(null);
    setError(err.message);
  };

  async function generate(input: GenerateInput) {
    setError(null);
    setPhase({ kind: "loading" });
    try {
      const body =
        "seeds" in input
          ? { size, seeds: input.seeds.map(({ uri, title, artists }) => ({ uri, title, artists })) }
          : { size, playlist: input.playlist };
      const result = await api<GenerateResult>("/api/similar", { method: "POST", body: JSON.stringify(body) });
      if (!result.tracks.length) {
        setError("Benzer şarkı bulunamadı. Başka bir playlist ya da şarkı dene.");
        setPhase({ kind: "pick" });
        return;
      }
      setPhase({ kind: "results", result });
    } catch (e) {
      fail(e);
      setPhase({ kind: "pick" });
    }
  }

  let content: React.ReactNode;
  if (user === undefined) {
    content = <p className="text-muted">Yükleniyor…</p>;
  } else if (phase.kind === "loading") {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-24 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        <p>Benzer şarkılar aranıyor…</p>
        <p className="text-sm text-muted">10–30 saniye sürebilir.</p>
      </div>
    );
  } else if (phase.kind === "results") {
    content = (
      <Results
        key={phase.result.source.name + phase.result.tracks.length}
        loggedIn={!!user}
        result={phase.result}
        initialRemoved={phase.removed}
        initialName={phase.name}
        onBack={() => setPhase({ kind: "pick" })}
        onSaved={(url, name, count) => setPhase({ kind: "saved", url, name, count })}
        onError={fail}
        error={error}
      />
    );
  } else if (phase.kind === "saved") {
    content = (
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
  } else {
    content = <Picker user={user} size={size} setSize={setSize} error={error} onGenerate={generate} onError={fail} />;
  }

  return (
    <Shell user={user} onLogout={() => setUser(null)}>
      {content}
    </Shell>
  );
}

function Shell({ user, onLogout, children }: { user?: User | null; onLogout: () => void; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-10 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold tracking-tight">
          <span className="text-accent">●</span> Benzer Playlist
        </span>
        {user ? (
          <div className="flex min-w-0 items-center gap-3 text-sm text-muted">
            <span className="truncate">{user.name}</span>
            <button
              className="shrink-0 rounded-full border border-line px-3 py-1 transition-colors hover:border-foreground hover:text-foreground"
              onClick={async () => {
                await api("/api/auth/logout", { method: "POST" });
                onLogout();
              }}
            >
              Çıkış
            </button>
          </div>
        ) : (
          user === null && (
            <a
              href="/api/auth/login"
              className="rounded-full border border-line px-3 py-1 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              Spotify ile bağlan
            </a>
          )
        )}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

function Picker({
  user,
  size,
  setSize,
  error,
  onGenerate,
  onError,
}: {
  user: User | null;
  size: number;
  setSize: (n: number) => void;
  error: string | null;
  onGenerate: (input: GenerateInput) => void;
  onError: (e: unknown) => void;
}) {
  const [tab, setTab] = useState<"link" | "songs">("link");
  const [link, setLink] = useState("");

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
          Bir playlist ya da birkaç şarkı ver, benzerlerini bulalım.
        </h1>
        <p className="max-w-xl text-muted text-pretty">
          Spotify &quot;benzer playlist&quot; özelliğini kaldırdı; bu araç Last.fm verisiyle benzer şarkıları bulur. Giriş
          gerekmez — sadece sonucu doğrudan Spotify&apos;a kaydetmek istersen bağlanırsın.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div role="tablist" className="flex w-fit gap-1 rounded-full border border-line p-1 text-sm">
          {(
            [
              ["link", "Playlist linki"],
              ["songs", "Şarkılardan başla"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-1.5 transition-colors ${tab === id ? "bg-foreground text-background" : "text-muted hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "link" ? (
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (link.trim()) onGenerate({ playlist: link.trim() });
            }}
          >
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="open.spotify.com/playlist/…"
              className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-3 outline-none placeholder:text-muted focus:border-accent"
            />
            <PrimaryButton disabled={!link.trim()}>Benzerini oluştur</PrimaryButton>
          </form>
        ) : (
          <SongPicker onGenerate={(seeds) => onGenerate({ seeds })} onError={onError} />
        )}

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
        {tab === "link" && (
          <p className="text-xs text-muted">
            Herkese açık her playlist olur. Giriş yapmadan veya başkasının playlist&apos;inde ilk 50 şarkı kullanılır.
          </p>
        )}
        {error && <ErrorBox>{error}</ErrorBox>}
      </div>

      {user && <MyPlaylists onPick={(id) => onGenerate({ playlist: id })} onError={onError} />}
    </section>
  );
}

const MAX_SEEDS = 10;

function SongPicker({ onGenerate, onError }: { onGenerate: (seeds: SearchTrack[]) => void; onError: (e: unknown) => void }) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchTrack[]>([]);
  const [selected, setSelected] = useState<SearchTrack[]>([]);
  const latest = useRef("");

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timer = setTimeout(() => {
      latest.current = q;
      api<{ tracks: SearchTrack[] }>(`/api/search?q=${encodeURIComponent(q)}`)
        .then((d) => latest.current === q && setHits(d.tracks))
        .catch(onError);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const add = (t: SearchTrack) => {
    setSelected((s) => (s.some((x) => x.uri === t.uri) || s.length >= MAX_SEEDS ? s : [...s, t]));
    setQuery("");
    setHits([]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length < 2) setHits([]);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setHits([]);
            if (e.key === "Enter" && hits[0]) {
              e.preventDefault();
              add(hits[0]);
            }
          }}
          disabled={selected.length >= MAX_SEEDS}
          placeholder={selected.length >= MAX_SEEDS ? `En fazla ${MAX_SEEDS} şarkı` : "Şarkı veya sanatçı ara…"}
          aria-label="Şarkı ara"
          className="w-full rounded-full border border-line bg-surface px-5 py-3 outline-none placeholder:text-muted focus:border-accent disabled:opacity-50"
        />
        {hits.length > 0 && query.trim().length >= 2 && (
          <ul className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line bg-background p-1 shadow-xl">
            {hits.map((t) => (
              <li key={t.uri}>
                <button
                  onClick={() => add(t)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface"
                >
                  <Cover src={t.image} className="h-9 w-9 shrink-0 rounded" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.title}</span>
                    <span className="block truncate text-xs text-muted">{t.artists.join(", ")}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((t) => (
            <li key={t.uri} className="flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2 text-sm">
              <Cover src={t.image} className="h-6 w-6 shrink-0 rounded-full" />
              <span className="truncate">
                {t.title} <span className="text-muted">· {t.artists[0]}</span>
              </span>
              <button
                aria-label={`${t.title} çıkar`}
                onClick={() => setSelected((s) => s.filter((x) => x.uri !== t.uri))}
                className="shrink-0 px-1 text-muted hover:text-foreground"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <PrimaryButton className="w-fit" disabled={!selected.length} onClick={() => onGenerate(selected)}>
        {selected.length ? `${selected.length} şarkıdan benzer oluştur` : "Önce şarkı seç"}
      </PrimaryButton>
    </div>
  );
}

function MyPlaylists({ onPick, onError }: { onPick: (id: string) => void; onError: (e: unknown) => void }) {
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);

  useEffect(() => {
    api<{ playlists: Playlist[] }>("/api/playlists")
      .then((d) => setPlaylists(d.playlists))
      .catch(onError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
                onClick={() => onPick(p.id)}
                title={p.fullAccess ? undefined : "Senin olmadığı için ilk 50 şarkısı kullanılır"}
                className="flex w-full flex-col gap-2 rounded-xl p-2 text-left transition-colors hover:bg-surface"
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
  );
}

function Results({
  loggedIn,
  result,
  initialRemoved,
  initialName,
  onBack,
  onSaved,
  onError,
  error,
}: {
  loggedIn: boolean;
  result: GenerateResult;
  initialRemoved?: string[];
  initialName?: string;
  onBack: () => void;
  onSaved: (url: string, name: string, count: number) => void;
  onError: (e: unknown) => void;
  error: string | null;
}) {
  const [removed, setRemoved] = useState<Set<string>>(() => new Set(initialRemoved));
  const [name, setName] = useState(initialName ?? `${result.source.name} — Benzer`);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const kept = useMemo(() => result.tracks.filter((t) => !removed.has(t.uri)), [result.tracks, removed]);

  async function save() {
    setSaving(true);
    try {
      const pl = await api<{ url: string }>("/api/save", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: `"${result.source.name}" benzeri şarkılar.`,
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

  async function copyLinks() {
    try {
      await navigator.clipboard.writeText(kept.map((t) => `https://open.spotify.com/track/${t.id}`).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      onError(e);
    }
  }

  function loginToSave() {
    try {
      const pending: Pending = { result, removed: [...removed], name };
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch {}
    // A route handler that redirects off-site, so a full navigation is required.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/auth/login";
  }

  const { source, stats } = result;
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <button onClick={onBack} className="w-fit text-sm text-muted hover:text-foreground">
          ← Geri
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">&quot;{source.name}&quot; benzeri</h1>
        <p className="text-sm text-muted">
          {source.trackCount} şarkı{source.partial ? " (playlist'in ilk kısmı)" : ""}, {stats.seeds} tanesi tohum olarak
          kullanıldı · {kept.length} öneri
        </p>
      </div>

      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 border-b border-line bg-background/90 px-4 py-3 backdrop-blur sm:flex-row">
        {loggedIn ? (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              aria-label="Playlist adı"
              className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-2.5 outline-none focus:border-accent"
            />
            <PrimaryButton onClick={save} disabled={saving || !kept.length || !name.trim()}>
              {saving ? "Kaydediliyor…" : `Spotify'a kaydet (${kept.length})`}
            </PrimaryButton>
          </>
        ) : (
          <>
            <PrimaryButton onClick={loginToSave} disabled={!kept.length}>
              Spotify&apos;a kaydetmek için bağlan
            </PrimaryButton>
            <button
              onClick={copyLinks}
              disabled={!kept.length}
              className="rounded-full border border-line px-5 py-2.5 transition-colors hover:border-foreground disabled:opacity-40"
            >
              {copied ? "Kopyalandı ✓" : `Linkleri kopyala (${kept.length})`}
            </button>
          </>
        )}
      </div>
      {!loggedIn && (
        <p className="-mt-3 text-xs text-muted">
          Linkleri kopyalayıp Spotify masaüstü uygulamasında bir playlist&apos;e yapıştırırsan (Ctrl/Cmd+V) şarkılar eklenir.
        </p>
      )}
      {error && <ErrorBox>{error}</ErrorBox>}

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

function PrimaryButton({ className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full bg-accent px-6 py-3 font-semibold text-black transition-transform active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 ${className}`}
    />
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm">{children}</p>;
}

function Cover({ src, className }: { src: string | null; className: string }) {
  if (!src) return <div className={`${className} bg-surface`} />;
  // Spotify CDN images are already sized; next/image optimisation adds nothing here.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className={`${className} object-cover bg-surface`} />;
}
