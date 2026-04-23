const API_URL = "https://localhost:3000/api";

export const getAllRoles = async () => {
  try {
    const response = await fetch(`${API_URL}/roles`, {
      method: "GET",
      credentials: "include", // <--- CRUCIAL para que viajen tus cookies
      headers: {
        Accept: "application/json", // Es mejor usar Accept en GET
      },
    });

    if (!response.ok) {
      // Si el backend devuelve 401 o 403, esto fallará
      throw new Error("No autorizado para ver roles");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getAllRoles api:", error);
    throw error;
  }
};
