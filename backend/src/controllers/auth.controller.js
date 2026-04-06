import {
  getSessionUser,
  loginUser,
  registerUser,
  searchUsers,
} from "../services/auth.service.js";

const getBearerToken = (headers) => {
  const authorization = headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return null;
  return authorization.replace("Bearer ", "").trim();
};

export const register = (req, res) => {
  try {
    const user = registerUser(req.body || {});
    return res.status(201).json({ user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const login = (req, res) => {
  try {
    const result = loginUser(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

export const me = (req, res) => {
  const token = getBearerToken(req.headers);
  if (!token) return res.status(401).json({ error: "Token requerido" });

  const user = getSessionUser(token);
  if (!user) return res.status(401).json({ error: "Sesion invalida" });
  return res.status(200).json({ user });
};

export const listUsers = (req, res) => {
  const users = searchUsers(req.query.search || "");
  return res.status(200).json({ users });
};
