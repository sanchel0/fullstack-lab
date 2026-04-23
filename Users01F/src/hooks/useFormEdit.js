import { useState } from "react";

export const useFormEdit = (originalData, saveService) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // 1. Capturar datos del formulario
    const formData = new FormData(event.currentTarget);
    const sentData = Object.fromEntries(formData.entries());

    // 2. Filtrar solo los campos que cambiaron (Dirty Fields)
    const updatedData = {};
    Object.keys(sentData).forEach((key) => {
      // Comparamos como string para evitar líos de tipos (1 vs "1")
      if (String(sentData[key]) !== String(originalData[key])) {
        updatedData[key] = sentData[key];
      }
    });

    // 3. Si no hay cambios, no hacemos nada
    if (Object.keys(updatedData).length === 0) {
      alert("No se detectaron cambios.");
      setIsSubmitting(false);
      return { status: "no_changes" };
    }

    try {
      // 4. Llamar al servicio que pasamos por parámetro
      const result = await saveService(updatedData);
      alert("Actualizado con éxito");
      setIsSubmitting(false);
      return { status: "success", data: result };
    } catch (error) {
      setIsSubmitting(false);
      alert("Error: " + (error.response?.data?.error || error.message));
      return { status: "error", error };
    }
  };

  return { handleSubmit, isSubmitting };
};
