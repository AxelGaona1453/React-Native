import crypto from "crypto";

const users = [];
const sessions = new Map();

const hashPassword = (password) =>
  crypto.createHash("sha256").update(password).digest("hex");

export const registerUser = ({ username, password }) => {
  const normalizedUsername = username?.trim().toLowerCase();
  if (!normalizedUsername || !password) {
    throw new Error("Usuario y password son obligatorios");
  }

  if (users.some((user) => user.username === normalizedUsername)) {
    throw new Error("El usuario ya existe");
  }

  const user = {
    id: crypto.randomUUID(),
    username: normalizedUsername,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  return { id: user.id, username: user.username, createdAt: user.createdAt };
};

export const loginUser = ({ username, password }) => {
  const normalizedUsername = username?.trim().toLowerCase();
  const user = users.find((item) => item.username === normalizedUsername);
  if (!user || user.passwordHash !== hashPassword(password || "")) {
    throw new Error("Credenciales invalidas");
  }

  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, user.id);
  return { token, user: { id: user.id, username: user.username } };
};

export const getSessionUser = (token) => {
  const userId = sessions.get(token);
  if (!userId) return null;
  const user = users.find((item) => item.id === userId);
  if (!user) return null;
  return { id: user.id, username: user.username, createdAt: user.createdAt };
};

export const searchUsers = (query = "") => {
  const term = query.trim().toLowerCase();
  return users
    .filter((user) => !term || user.username.includes(term))
    .slice(0, 20)
    .map((user) => ({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    }));
};
