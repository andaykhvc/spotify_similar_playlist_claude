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
  denied: "Spotify izni verilmedi. Kaydetmek için tekrar bağlanabilirsin.",
  state: "Bağlantı yarıda kaldı. Tekrar bağlan.",
  spotify: "Spotify bağlantısı başarısız oldu. Tekrar dene.",
  login:
    "Spotify bağlantısı reddedildi. Uygulama geliştirme modundayken sadece Spotify Dashboard → User Management'a eklenen hesaplar bağlanabilir.",
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
  if (!res.ok) throw Object.assign(new Error(data.error ?? "Bir şeyler ters gitti, tekrar dene."), { auth: !!data.auth });
  return data as T;
}

type Phase =
  | { kind: "pick" }
  | { kind: "loading"; label: string }
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
    setPhase({
      kind: "loading",
      label: "seeds" in input ? input.seeds.map((s) => s.title).slice(0, 2).join(", ") : "playlist",
    });
    window.scrollTo({ top: 0 });
    try {
      const body =
        "seeds" in input
          ? { size, seeds: input.seeds.map(({ uri, title, artists }) => ({ uri, title, artists })) }
          : { size, playlist: input.playlist };
      const result = await api<GenerateResult>("/api/similar", { method: "POST", body: JSON.stringify(body) });
      if (!result.tracks.length) {
        setError("Bu kaynak için benzer şarkı bulunamadı. Daha bilinen birkaç şarkıyla dene.");
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
    content = null;
  } else if (phase.kind === "loading") {
    content = <Loading label={phase.label} />;
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
    content = <Saved {...phase} onAgain={() => setPhase({ kind: "pick" })} />;
  } else {
    content = <Picker user={user} size={size} setSize={setSize} error={error} onGenerate={generate} onError={fail} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-16 sm:px-8">
      <header className="flex h-16 items-center justify-between gap-4 sm:h-20">
        {phase.kind === "pick" ? <span /> : <SmallMark />}
        <Account user={user} onLogout={() => setUser(null)} />
      </header>
      <main className="flex flex-1 flex-col">{content}</main>
    </div>
  );
}

function SmallMark() {
  return (
    <span className="display flex items-center gap-2 text-lg leading-none tracking-[-0.02em]">
      <EchoGlyph className="h-5 w-5 text-accent" />
      Echo List
    </span>
  );
}

function EchoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="7" cy="12" r="3" fill="currentColor" />
      <path d="M12 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".75" />
      <path d="M15.5 3.5a11.5 11.5 0 0 1 0 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

function Account({ user, onLogout }: { user: User | null | undefined; onLogout: () => void }) {
  if (user === undefined) return null;
  if (!user) {
    return (
      <a href="/api/auth/login" className="press rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink">
        Spotify ile bağlan
      </a>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-1 text-sm">
      <span className="truncate text-muted">{user.name}</span>
      <button
        className="press shrink-0 rounded-full px-3 py-1.5 text-muted hover:text-ink"
        onClick={async () => {
          await api("/api/auth/logout", { method: "POST" });
          onLogout();
        }}
      >
        Çıkış yap
      </button>
    </div>
  );
}

/** Text followed by fading outlined copies of itself: the brand's echo. */
function Echo({ children }: { children: React.ReactNode }) {
  return (
    <span className="echo">
      {children}
      {[1, 2, 3].map((i) => (
        <span key={i} aria-hidden className="echo-ghost" style={{ "--i": i } as React.CSSProperties}>
          {children}
        </span>
      ))}
    </span>
  );
}

function Wordmark() {
  return (
    <h1 className="display text-[clamp(5rem,24vw,9.5rem)] leading-[0.8] tracking-[-0.045em]">
      <Echo>
        Echo
        <br />
        List
      </Echo>
    </h1>
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
  const [tab, setTab] = useState<0 | 1>(0);
  const [link, setLink] = useState("");

  return (
    <section className="flex flex-col">
      <div className="pt-6 pb-10 sm:pt-10 sm:pb-14">
        <Wordmark />
        <p className="mt-7 max-w-[34ch] text-lg leading-snug text-muted text-pretty sm:text-xl">
          Sevdiğin bir playlist&apos;e ya da birkaç şarkıya benzeyen yeni şarkılar bul. Giriş gerekmez.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div role="tablist" aria-label="Kaynak" className="segmented w-full max-w-sm text-sm font-medium" data-active={tab}>
          <span className="segmented-thumb" aria-hidden />
          {["Playlist linki", "Şarkılar"].map((label, i) => (
            <button
              key={label}
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i as 0 | 1)}
              className={`relative z-10 rounded-full py-2 transition-colors ${tab === i ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 0 ? (
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
              aria-label="Spotify playlist linki"
              inputMode="url"
              autoComplete="off"
              className="field min-w-0 sm:flex-1"
            />
            <PrimaryButton disabled={!link.trim()}>Benzerlerini bul</PrimaryButton>
          </form>
        ) : (
          <SongPicker onGenerate={(seeds) => onGenerate({ seeds })} onError={onError} />
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <label className="flex items-center gap-3">
            Kaç şarkı
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-36"
            />
            <span className="w-7 tabular-nums text-ink">{size}</span>
          </label>
          {tab === 0 && <span>Herkese açık her playlist olur; giriş yoksa ilk 50 şarkısına bakılır.</span>}
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}
      </div>

      {user && <MyPlaylists onPick={(id) => onGenerate({ playlist: id })} onError={onError} />}
    </section>
  );
}

const MAX_SEEDS = 10;

function SongPicker({ onGenerate, onError }: { onGenerate: (seeds: SearchTrack[]) => void; onError: (e: unknown) => void }) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchTrack[]>([]);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<SearchTrack[]>([]);
  const latest = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timer = setTimeout(() => {
      latest.current = q;
      api<{ tracks: SearchTrack[] }>(`/api/search?q=${encodeURIComponent(q)}`)
        .then((d) => {
          if (latest.current !== q) return;
          setHits(d.tracks);
          setActive(0);
        })
        .catch(onError);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const add = (t: SearchTrack) => {
    setSelected((s) => (s.some((x) => x.uri === t.uri) || s.length >= MAX_SEEDS ? s : [...s, t]));
    setQuery("");
    setHits([]);
    inputRef.current?.focus();
  };

  const open = hits.length > 0 && query.trim().length >= 2;
  const full = selected.length >= MAX_SEEDS;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length < 2) setHits([]);
          }}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (a + (e.key === "ArrowDown" ? 1 : hits.length - 1)) % hits.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              add(hits[active]);
            } else if (e.key === "Escape") {
              setHits([]);
            }
          }}
          disabled={full}
          role="combobox"
          aria-expanded={open}
          aria-controls="song-results"
          aria-activedescendant={open ? `song-${active}` : undefined}
          aria-label="Şarkı ara"
          placeholder={full ? `En fazla ${MAX_SEEDS} şarkı seçebilirsin` : "Şarkı ya da sanatçı ara"}
          autoComplete="off"
          className="field w-full disabled:opacity-50"
        />
        {open && (
          <ul
            id="song-results"
            role="listbox"
            className="popover material absolute inset-x-0 top-full z-20 mt-2 max-h-[22rem] overflow-y-auto rounded-2xl p-1.5"
          >
            {hits.map((t, i) => (
              <li key={t.uri} id={`song-${i}`} role="option" aria-selected={i === active}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => add(t)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left ${i === active ? "bg-ink/[0.06]" : ""}`}
                >
                  <Cover src={t.image} className="h-10 w-10 shrink-0 rounded-md" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{t.title}</span>
                    <span className="block truncate text-sm text-muted">{t.artists.join(", ")}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Seçilen şarkılar">
          {selected.map((t) => (
            <li key={t.uri} className="chip-in flex max-w-full items-center gap-2 rounded-full bg-raised py-1 pl-1 pr-1 text-sm shadow-[0_1px_2px_rgb(22_26_36/0.08)]">
              <Cover src={t.image} className="h-7 w-7 shrink-0 rounded-full" />
              <span className="truncate">
                {t.title} <span className="text-muted">— {t.artists[0]}</span>
              </span>
              <button
                aria-label={`${t.title} şarkısını çıkar`}
                onClick={() => setSelected((s) => s.filter((x) => x.uri !== t.uri))}
                className="press grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink"
              >
                <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                  <path d="M2.5 2.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <PrimaryButton className="w-full sm:w-fit" disabled={!selected.length} onClick={() => onGenerate(selected)}>
        {selected.length ? `${selected.length} şarkının benzerlerini bul` : "Önce birkaç şarkı seç"}
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
    <div className="mt-16 flex flex-col gap-5">
      <h2 className="display text-2xl leading-tight tracking-[-0.02em]">Playlist&apos;lerin</h2>
      {playlists === null ? (
        <p className="text-muted">Playlist&apos;lerin yükleniyor…</p>
      ) : playlists.length === 0 ? (
        <p className="text-muted">Spotify hesabında henüz playlist yok. Yukarıdan bir link ya da şarkı ile başla.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
          {playlists.map((p, i) => (
            <li key={p.id} className="arrive" style={{ "--i": i } as React.CSSProperties}>
              <button
                onClick={() => onPick(p.id)}
                title={p.fullAccess ? undefined : "Senin olmadığı için ilk 50 şarkısına bakılır"}
                className="press group flex w-full flex-col gap-2.5 text-left"
              >
                <Cover
                  src={p.image}
                  className="aspect-square w-full rounded-xl transition-[box-shadow,transform] duration-200 group-hover:shadow-[var(--shadow)]"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block truncate text-sm text-muted">
                    {p.total !== null ? `${p.total} şarkı, ` : ""}
                    {p.owner}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-24 text-center" role="status" aria-live="polite">
      <div className="ripple" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="display text-2xl leading-tight tracking-[-0.02em]">
          {label === "playlist" ? "Playlist dinleniyor…" : `${label} dinleniyor…`}
        </p>
        <p className="text-muted">Benzer şarkılar aranıyor. Bu 10–30 saniye sürebilir.</p>
      </div>
    </div>
  );
}

function Saved({ url, name, count, onAgain }: { url: string; name: string; count: number; onAgain: () => void }) {
  return (
    <section className="flex flex-1 flex-col justify-center gap-6 pb-24">
      <h2 className="display text-[clamp(3rem,10vw,5rem)] leading-[0.95] tracking-[-0.035em]">
        <Echo>Kaydedildi.</Echo>
      </h2>
      <p className="arrive max-w-[40ch] text-lg text-muted" style={{ "--i": 2 } as React.CSSProperties}>
        &quot;{name}&quot; {count} şarkıyla Spotify hesabına gizli playlist olarak eklendi.
      </p>
      <div className="arrive flex flex-wrap gap-3" style={{ "--i": 4 } as React.CSSProperties}>
        <a href={url} target="_blank" rel="noreferrer" className="btn-primary press">
          Spotify&apos;da aç
        </a>
        <button className="btn-secondary press" onClick={onAgain}>
          Yeni liste oluştur
        </button>
      </div>
    </section>
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
  const [name, setName] = useState(initialName ?? `${result.source.name} (Echo)`);
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
          description: `"${result.source.name}" ile benzer şarkılar. Echo List ile oluşturuldu.`,
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

  function connectToSave() {
    try {
      const pending: Pending = { result, removed: [...removed], name };
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch {}
    // A route handler that redirects off-site, so a full navigation is required.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/auth/login";
  }

  const { source } = result;
  return (
    <section className="flex flex-col">
      <button onClick={onBack} className="press -ml-2 flex w-fit items-center gap-1 rounded-full px-2 py-1 text-muted hover:text-ink">
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
          <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Yeni arama
      </button>

      <div className="mt-6 mb-8 flex flex-col gap-3">
        <h1 className="display text-[clamp(2.25rem,7vw,3.75rem)] leading-[0.98] tracking-[-0.03em] text-balance">{source.name}</h1>
        <p className="text-muted">
          {source.partial ? `Playlist'in ilk ${source.trackCount} şarkısına` : `${source.trackCount} şarkıya`} benzeyen{" "}
          {kept.length} şarkı. Beğenmediklerini çıkar, kalanları kaydet.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      <ol className="flex flex-col">
        {result.tracks.map((t, i) => (
          <TrackRow
            key={t.uri}
            index={i}
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

      {/* Floating action bar: a translucent layer the list scrolls under. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-8 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] material sm:-mx-8 sm:px-8 [mask-image:linear-gradient(to_bottom,transparent,black_12px)]">
        {loggedIn ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              aria-label="Yeni playlist'in adı"
              className="field min-w-0 sm:flex-1"
            />
            <PrimaryButton onClick={save} disabled={saving || !kept.length || !name.trim()}>
              {saving ? "Kaydediliyor…" : `Spotify'a kaydet (${kept.length})`}
            </PrimaryButton>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <PrimaryButton onClick={connectToSave} disabled={!kept.length} className="min-w-0 flex-1 text-[0.9375rem] [--btn-px:0.75rem] sm:text-base sm:[--btn-px:1.5rem]">
                <span className="sm:hidden">Spotify&apos;a kaydet</span>
                <span className="hidden sm:inline">Bağlan ve Spotify&apos;a kaydet</span>
              </PrimaryButton>
              <button onClick={copyLinks} disabled={!kept.length} className="btn-secondary press min-w-0 flex-1 text-[0.9375rem] [--btn-px:0.75rem] sm:text-base sm:[--btn-px:1.5rem]" aria-live="polite">
                {copied ? (
                  <span key="done" className="swap inline-flex items-center gap-1.5">
                    <svg viewBox="0 0 16 16" className="h-4 w-4 text-accent" aria-hidden>
                      <path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Kopyalandı
                  </span>
                ) : (
                  <span key="idle" className="swap inline-flex">
                    Linkleri kopyala<span className="hidden sm:inline">&nbsp;({kept.length})</span>
                  </span>
                )}
              </button>
            </div>
            <p className="text-center text-xs text-muted sm:text-left">
              Kopyaladığın linkleri Spotify masaüstü uygulamasında bir playlist&apos;e yapıştırırsan şarkılar eklenir.
            </p>
          </div>
        )}
      </div>
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
      className="arrive group -mx-3 flex items-center gap-4 rounded-2xl px-3 py-2.5 hover:bg-raised/70"
      style={{ "--i": index } as React.CSSProperties}
    >
      <Cover src={track.image} className={`h-14 w-14 shrink-0 rounded-lg transition-opacity ${removed ? "opacity-30" : ""}`} />
      <div className={`min-w-0 flex-1 transition-opacity ${removed ? "opacity-40" : ""}`}>
        <a
          href={`https://open.spotify.com/track/${track.id}`}
          target="_blank"
          rel="noreferrer"
          className={`block truncate font-medium decoration-1 underline-offset-2 hover:underline ${removed ? "line-through" : ""}`}
        >
          {track.name}
        </a>
        <p className="truncate text-muted">{track.artists.join(", ")}</p>
        {track.because.length > 0 && (
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted">
            <EchoGlyph className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="truncate">{track.because.join(", ")} yankısı</span>
          </p>
        )}
      </div>
      <button
        onClick={onToggle}
        aria-label={removed ? `${track.name} şarkısını geri ekle` : `${track.name} şarkısını çıkar`}
        className={`press shrink-0 rounded-full px-3 py-1.5 text-sm ${removed ? "bg-surface text-ink" : "text-muted hover:bg-surface hover:text-ink"}`}
      >
        {removed ? "Geri ekle" : "Çıkar"}
      </button>
    </li>
  );
}

function PrimaryButton({ className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`btn-primary press ${className}`} />;
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex gap-3 rounded-2xl bg-danger/10 px-4 py-3 text-sm leading-relaxed text-ink">
      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden>
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path d="M8 4.5v4.2M8 11.2v.1" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

function Cover({ src, className }: { src: string | null; className: string }) {
  if (!src) {
    return (
      <div className={`${className} grid place-items-center bg-surface text-muted`}>
        <EchoGlyph className="h-1/3 w-1/3 opacity-60" />
      </div>
    );
  }
  // Spotify CDN images are already sized; next/image optimisation adds nothing here.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className={`${className} bg-surface object-cover`} />;
}
