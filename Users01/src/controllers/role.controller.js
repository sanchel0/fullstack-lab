import RoleModel from "../models/role.model.js";

export const getRoles = async (req, res) => {
  try {
    const roles = await RoleModel.findAll();
    res.json(roles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ error: "Error al obtener la lista de roles" });
  }
};
