export type ThemeMode = "light" | "dark";

const themeStorageKey = "gurimaal-theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setStoredTheme(theme: ThemeMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(themeStorageKey, theme);
  applyTheme(theme);
}
