export { en } from "./en";
export { uk } from "./uk";
export { ru } from "./ru";
export type { Translations, Locale } from "./types";

import { en } from "./en";
import { uk } from "./uk";
import { ru } from "./ru";
import type { Locale, Translations } from "./types";

export const locales: Record<Locale, { label: string; dict: Translations }> = {
  en: { label: "English", dict: en },
  uk: { label: "Українська", dict: uk },
  ru: { label: "Русский", dict: ru },
};

export function getDict(locale: Locale): Translations {
  return locales[locale]?.dict ?? en;
}
