import https from "https";
import fs from "fs";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const httpsOptions = {
  key: fs.readFileSync("./localhost-key.pem"),
  cert: fs.readFileSync("./localhost.pem"),
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`✅ Servidor SEGURO corriendo en https://localhost:${PORT}`);
});
