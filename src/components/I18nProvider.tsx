"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getDict, type Locale, type Translations } from "@/lib/i18n";
import { en } from "@/lib/i18n/en";

interface I18nCtx {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
}

const Ctx = createContext<I18nCtx>({ locale: "en", t: en, setLocale: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [t, setT] = useState<Translations>(en);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && ["en", "uk", "ru"].includes(saved)) {
      setLocaleState(saved);
      setT(getDict(saved));
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    setT(getDict(l));
    localStorage.setItem("locale", l);
  }

  return <Ctx.Provider value={{ locale, t, setLocale }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
