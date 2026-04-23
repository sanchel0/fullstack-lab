import { create } from "zustand";
import { persist } from "zustand/middleware";
import { updateProfile } from "../services/auth";
import { useAuthStore } from "./useAuthStore";

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      theme: "light",
      language: "es",

      // Cambiar tema (Local + Opcional API)
      setTheme: async (newTheme) => {
        set({ theme: newTheme });

        // Obtenemos el estado de autenticación de forma "silenciosa"
        const { isAuthenticated } = useAuthStore.getState();

        // Si está logueado, sincronizamos con la DB
        if (isAuthenticated) {
          try {
            await updateProfile({
              preferences: {
                theme: newTheme,
              },
            });
          } catch (err) {
            console.error(
              "No se pudo sincronizar el tema con el servidor:",
              err,
            );
            // Opcional: podrías mostrar una notificación toast aquí
          }
        }
      },

      setLanguage: async (newLang) => {
        set({ language: newLang });

        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated) {
          try {
            await updateProfile({
              preferences: { language: newLang },
            });
          } catch (err) {
            console.error(
              "No se pudo sincronizar el tema con el servidor:",
              err,
            );
          }
        }
      },

      // Método para cuando el Login devuelve datos frescos
      syncPreferences: (prefs) => {
        if (prefs) {
          set({
            theme: prefs.theme || get().theme,
            language: prefs.language || get().language,
          });
        }
      },
    }),
    {
      name: "app-settings", // Nombre diferente al de auth
    },
  ),
);
