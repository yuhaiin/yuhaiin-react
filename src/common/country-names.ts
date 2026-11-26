import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Localized region names for ISO 3166-1 alpha-2 codes; other values pass through. */
export function useCountryNames() {
  const { i18n } = useTranslation();
  return useMemo(() => {
    let names: Intl.DisplayNames | undefined;
    try { names = new Intl.DisplayNames([i18n.resolvedLanguage || i18n.language || "en"], { type: "region" }); }
    catch { names = undefined; }
    return (code: string) => {
      if (!/^[A-Z]{2}$/.test(code)) return code;
      try { return names?.of(code) || code; } catch { return code; }
    };
  }, [i18n.resolvedLanguage, i18n.language]);
}
