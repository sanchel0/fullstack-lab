import Redis from "ioredis";
import dotenv from "dotenv";

// Por defecto se conecta a localhost:6379
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000), // Reintento si se cae
});

redis.on("connect", () => console.log("🚀 Conectado a Redis con éxito"));
redis.on("error", (err) => console.error("❌ Error en Redis:", err));

export default redis;
