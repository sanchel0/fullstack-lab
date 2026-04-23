import { useState } from "react";
import { useSettingsStore } from "../stores/useSettingsStore";

const LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);

  // Buscamos el nombre del idioma actual
  const currentLang =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        style={{ padding: "8px", cursor: "pointer", borderRadius: "4px" }}
      >
        {currentLang.flag} {currentLang.name} ▾
      </button>

      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            listStyle: "none",
            padding: "5px 0",
            margin: 0,
            minWidth: "120px",
            zIndex: 100,
          }}
        >
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              style={{
                padding: "8px 15px",
                cursor: "pointer",
                backgroundColor:
                  language === lang.code ? "#f0f0f0" : "transparent",
                color: "black",
                fontSize: "0.9rem",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e9e9e9")}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor =
                  language === lang.code ? "#f0f0f0" : "transparent")
              }
            >
              {lang.flag} {lang.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
