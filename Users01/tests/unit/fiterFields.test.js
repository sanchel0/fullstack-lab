import { filterAllowedFields } from "../../src/utils/utils.js";
import { describe, it, expect } from "vitest"; // Importas explícitamente las funciones

describe("filterAllowedFields", () => {
  it("debe filtrar los campos correctamente", () => {
    const res = filterAllowedFields({ a: 1, b: 2 }, ["a"]);
    expect(res).toEqual({ a: 1 });
  });
});
