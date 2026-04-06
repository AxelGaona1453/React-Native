const BASE_URL = "http://localhost:4000/api";

const readJsonOrThrow = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Error inesperado del servidor");
  }
  return data;
};

export const getChampions = async (search = "") => {
  const query = new URLSearchParams();
  if (search.trim()) query.set("search", search.trim());

  const response = await fetch(`${BASE_URL}/champions?${query.toString()}`);
  const data = await readJsonOrThrow(response);
  return data.champions || [];
};

export const getChampionById = async (id) => {
  const response = await fetch(`${BASE_URL}/champions/${id}`);
  const data = await readJsonOrThrow(response);
  return data.champion;
};

export const register = async (username, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return readJsonOrThrow(response);
};

export const login = async (username, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return readJsonOrThrow(response);
};

export const searchUsers = async (search = "") => {
  const response = await fetch(
    `${BASE_URL}/auth/users?search=${encodeURIComponent(search)}`,
  );
  return readJsonOrThrow(response);
};

export const getPlayerMatches = async (gameName, tagLine) => {
  const response = await fetch(
    `${BASE_URL}/lol/player-matches?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&count=5`,
  );
  return readJsonOrThrow(response);
};
