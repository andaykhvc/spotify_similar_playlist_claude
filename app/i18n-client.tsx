"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_LANG, messages, type Lang } from "@/lib/i18n";

// The chosen language lives in localStorage. useSyncExternalStore renders the default during
// prerender/hydration and switches to the stored choice right after, without a mismatch.
const KEY = "echo-lang";
const listeners = new Set<() => void>();

function read(): Lang {
  try {
    return localStorage.getItem(KEY) === "tr" ? "tr" : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {}
  listeners.forEach((l) => l());
}

export function useLang(): Lang {
  const lang = useSyncExternalStore(subscribe, read, () => DEFAULT_LANG);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return lang;
}

export function useT() {
  return messages[useLang()];
}

export function LangSwitch() {
  const lang = useLang();
  const t = messages[lang];
  return (
    <div role="group" aria-label={t.language} className="flex items-center rounded-full bg-surface p-0.5 text-xs font-semibold">
      {(["en", "tr"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          lang={l}
          className={`press rounded-full px-2.5 py-1 uppercase ${lang === l ? "bg-raised text-ink shadow-[0_1px_2px_rgb(22_26_36/0.12)]" : "text-muted hover:text-ink"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
