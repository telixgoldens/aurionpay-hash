import React, { createContext, useContext, useState } from "react";

export const LANGS = {
  en: { label: "EN", flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "English" },
  zh: { label: "\u4E2D\u6587", flag: "\uD83C\uDDE8\uD83C\uDDF3", name: "\u4E2D\u6587" },
};

const LanguageContext = createContext({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem("aurionpay_lang") || "en"
  );
  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem("aurionpay_lang", l);
  };
  return (
    <LanguageContext.Provider value={{ lang, setLang: switchLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

export function LangToggle({ style = {} }) {
  const { lang, setLang } = useLang();
  const next = lang === "en" ? "zh" : "en";
  const current = LANGS[lang];
  const nextLang = LANGS[next];

  return (
    <button
      onClick={() => setLang(next)}
      title={"Switch to " + nextLang.name}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "5px 11px", borderRadius: "20px", cursor: "pointer",
        background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)",
        color: "#94a3b8", fontFamily: "'Syne', sans-serif",
        fontSize: "12px", fontWeight: 700, transition: "all 180ms",
        userSelect: "none", whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#f1f5f9"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.18)"; e.currentTarget.style.color = "#94a3b8"; }}
    >
      <span>{current.flag}</span>
      <span>{current.label}</span>
    </button>
  );
}