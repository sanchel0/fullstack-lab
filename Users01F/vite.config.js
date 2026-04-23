import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
//import basicSsl from "@vitejs/plugin-basic-ssl";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    //basicSsl(), // <-- Esto genera un certificado automático para el front
  ],
  /*server: {
    https: true, // <-- Obliga a Vite a usar HTTPS
    port: 5173,
  },*/
  server: {
    https: {
      key: fs.readFileSync("./localhost-key.pem"),
      cert: fs.readFileSync("./localhost.pem"),
    },
  },
});
