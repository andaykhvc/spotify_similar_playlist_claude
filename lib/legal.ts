import type { Lang } from "./i18n";

// Who runs the site. Fill these in before relying on the legal pages:
// KVKK requires the data controller's identity and a way to reach them.
export const LEGAL = {
  controllerName: "",
  contactEmail: "",
  updatedAt: { en: "October 15, 2026", tr: "15 Ekim 2026" } satisfies Record<Lang, string>,
};

export const PLACEHOLDER: Record<Lang, string> = { en: "not added yet", tr: "henüz eklenmedi" };
