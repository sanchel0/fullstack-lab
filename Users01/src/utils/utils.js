export const filterAllowedFields = (body, allowedFields) => {
  const filteredData = {};

  allowedFields.forEach((field) => {
    // Solo si el campo fue enviado (no es undefined) lo agregamos
    if (body[field] !== undefined && body[field] !== null) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};
