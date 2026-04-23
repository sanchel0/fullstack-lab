import { useSettingsStore } from "../stores/useSettingsStore";

export default function ThemeToggle() {
  const { theme, setTheme } = useSettingsStore();

  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <button
      onClick={toggle}
      style={{
        background: theme === "light" ? "#eee" : "#333",
        border: "1px solid #ccc",
        borderRadius: "20px",
        padding: "5px 10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        position: "relative",
        transition: "all 0.3s ease",
      }}
    >
      <span
        style={{
          transform: theme === "light" ? "translateX(0)" : "translateX(25px)",
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          fontSize: "1.2rem",
        }}
      >
        {theme === "light" ? "☀️" : "🌙"}
      </span>
      <span
        style={{
          fontSize: "0.7rem",
          color: theme === "light" ? "#000" : "#fff",
        }}
      >
        {theme === "light" ? "Light" : "Dark"}
      </span>
    </button>
  );
}
