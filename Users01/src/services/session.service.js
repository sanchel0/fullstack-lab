import redis from "../config/redis.js";

export const saveUserSession = async (user) => {
  const sessionData = {
    id: user.id,
    username: user.username,
    role: user.role_name || user.role, // Maneja ambos nombres por si acaso
    preferences: user.preferences || {},
  };

  const redisKey = `user:session:${user.id}`;

  // Guardamos en Redis (1 hora de expiración)
  await redis.set(redisKey, JSON.stringify(sessionData), "EX", 3600);

  return sessionData;
};

export const deleteUserSession = async (userId) => {
  await redis.del(`user:session:${userId}`);
};
