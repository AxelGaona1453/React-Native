import { useEffect, useMemo, useState } from "react";
import ChampionSearchBar from "./components/ChampionSearchBar";
import ChampionList from "./components/ChampionList";
import ChampionDetail from "./components/ChampionDetail";
import {
  getChampionById,
  getChampions,
  getPlayerMatches,
  login,
  register,
} from "./services/champions.service";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [champions, setChampions] = useState([]);
  const [selectedChampionId, setSelectedChampionId] = useState("");
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authMessage, setAuthMessage] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [riotForm, setRiotForm] = useState({ gameName: "", tagLine: "" });
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    const loadChampions = async () => {
      setListLoading(true);
      setError(null);
      try {
        const result = await getChampions(search);
        setChampions(result);
      } catch (err) {
        setError("No se pudieron cargar los campeones. Revisa el backend.");
      } finally {
        setListLoading(false);
      }
    };

    const debounce = setTimeout(loadChampions, 250);
    return () => clearTimeout(debounce);
  }, [search]);

  useEffect(() => {
    if (!selectedChampionId) {
      setSelectedChampion(null);
      return;
    }

    const loadChampion = async () => {
      setDetailLoading(true);
      setError(null);
      try {
        const champion = await getChampionById(selectedChampionId);
        setSelectedChampion(champion);
      } catch (err) {
        setError("No se pudo cargar el detalle del campeon.");
      } finally {
        setDetailLoading(false);
      }
    };

    loadChampion();
  }, [selectedChampionId]);

  useEffect(() => {
    if (champions.length && !selectedChampionId) {
      setSelectedChampionId(champions[0].id);
    }
  }, [champions, selectedChampionId]);

  const listTitle = useMemo(() => {
    if (!search.trim()) return "Todos los campeones";
    return `Resultados para "${search}"`;
  }, [search]);

  const onLogin = async (event) => {
    event.preventDefault();
    try {
      const result = await login(authForm.username, authForm.password);
      localStorage.setItem("authToken", result.token);
      setToken(result.token);
      setAuthMessage("");
    } catch (err) {
      setAuthMessage(err.message);
    }
  };

  const onRegister = async (event) => {
    event.preventDefault();
    try {
      await register(authForm.username, authForm.password);
      setAuthMessage("Cuenta creada. Ahora inicia sesion.");
      setAuthMode("login");
    } catch (err) {
      setAuthMessage(err.message);
    }
  };

  const onLogout = () => {
    localStorage.removeItem("authToken");
    setToken("");
    setAuthForm({ username: "", password: "" });
    setAuthMessage("");
  };

  const onSearchMatches = async (event) => {
    event.preventDefault();
    try {
      const result = await getPlayerMatches(riotForm.gameName, riotForm.tagLine);
      setPlayerData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setPlayerData(null);
    }
  };

  if (!token) {
    return (
      <main className="login-view">
        <section className="login-card">
          <h1>{authMode === "login" ? "Iniciar sesion" : "Crear cuenta"}</h1>
          <p>
            {authMode === "login"
              ? "Ingresa con tu usuario para entrar a la app."
              : "Crea una cuenta si aun no tienes una."}
          </p>
          <form className="modal-form" onSubmit={authMode === "login" ? onLogin : onRegister}>
            <input
              className="search-input"
              placeholder="usuario"
              value={authForm.username}
              onChange={(e) =>
                setAuthForm((prev) => ({ ...prev, username: e.target.value }))
              }
            />
            <input
              className="search-input"
              type="password"
              placeholder="password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm((prev) => ({ ...prev, password: e.target.value }))
              }
            />
            <button type="submit">
              {authMode === "login" ? "Entrar" : "Registrar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode((prev) => (prev === "login" ? "register" : "login"));
                setAuthMessage("");
              }}
            >
              {authMode === "login"
                ? "No tengo cuenta, crear una"
                : "Ya tengo cuenta, iniciar sesion"}
            </button>
          </form>
          {authMessage && <p className="status-message error">{authMessage}</p>}
        </section>
      </main>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>LoL Champion Finder</h1>
        <p>Busca campeones y mira builds recomendadas por elo.</p>
        <div className="header-actions">
          <button type="button" onClick={onLogout}>Cerrar sesion</button>
        </div>
      </header>

      <ChampionSearchBar value={search} onChange={setSearch} />

      {error && <p className="status-message error">{error}</p>}

      <section className="panel">
        <h2 className="section-title">Buscar jugador y ultimas partidas</h2>
        <form className="inline-form" onSubmit={onSearchMatches}>
          <input
            className="search-input"
            placeholder="gameName (ej: Faker)"
            value={riotForm.gameName}
            onChange={(e) =>
              setRiotForm((prev) => ({ ...prev, gameName: e.target.value }))
            }
          />
          <input
            className="search-input"
            placeholder="tagLine (ej: KR1)"
            value={riotForm.tagLine}
            onChange={(e) =>
              setRiotForm((prev) => ({ ...prev, tagLine: e.target.value }))
            }
          />
          <button type="submit">Buscar partidas</button>
        </form>
        {playerData && (
          <div className="matches-list">
            <p>
              {playerData.player.gameName}#{playerData.player.tagLine}
            </p>
            {playerData.matches.map((match) => (
              <article key={match.matchId} className="match-card">
                <strong>{match.championName}</strong> - {match.result} - KDA {match.kda} - CS{" "}
                {match.cs} - {match.gameDurationMinutes} min
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">{listTitle}</h2>
        {listLoading ? (
          <p className="status-message">Cargando campeones...</p>
        ) : (
          <ChampionList
            champions={champions}
            selectedChampionId={selectedChampionId}
            onSelect={setSelectedChampionId}
          />
        )}
      </section>

      <ChampionDetail champion={selectedChampion} loading={detailLoading} />
    </div>
  );
}

export default App;