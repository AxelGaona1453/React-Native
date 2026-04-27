import { useEffect, useMemo, useState } from "react";
import ChampionSearchBar from "./components/ChampionSearchBar";
import ChampionList from "./components/ChampionList";
import ChampionDetail from "./components/ChampionDetail";
import ChampionBuildManager from "./components/ChampionBuildManager";
import AuthSection from "./components/AuthSection";
import PlayerSearchPanel from "./components/PlayerSearchPanel";
import ChampionAdmin from "./components/ChampionAdmin";
import useAuth from "./hooks/useAuth";
import useChampionDetail from "./hooks/useChampionDetail";
import useChampionBuilds from "./hooks/useChampionBuilds";
import usePlayerMatches from "./hooks/usePlayerMatches";
import { useGlobalChampions } from "./context/ChampionContext";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");

  const { champions, loading: listLoading, error: championError, fetchChampions } = useGlobalChampions();

  // Cargar campeones cuando cambie la búsqueda
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchChampions(search);
    }, 250);
    return () => clearTimeout(debounce);
  }, [search, fetchChampions]);

  const {
    selectedChampionId,
    selectedChampion,
    detailLoading,
    error: detailError,
    setSelectedChampionId,
    refreshChampion,
  } = useChampionDetail(champions);

  const {
    token,
    authMode,
    authForm,
    authMessage,
    setAuthForm,
    setAuthMode,
    setAuthMessage,
    login,
    register,
    logout,
  } = useAuth();

  const {
    riotForm,
    setRiotForm,
    playerData,
    error: playerError,
    searchPlayerMatches,
  } = usePlayerMatches();

  const {
    customBuilds,
    loading: customBuildsLoading,
    error: customBuildsError,
    refresh: refreshChampionBuilds,
  } = useChampionBuilds(selectedChampionId);

  const error = championError || detailError || playerError;

  const listTitle = useMemo(() => {
    if (!search.trim()) return "Todos los campeones";
    return `Resultados para "${search}"`;
  }, [search]);

  if (!token) {
    return (
      <AuthSection
        authMode={authMode}
        authForm={authForm}
        authMessage={authMessage}
        setAuthForm={setAuthForm}
        onSubmit={authMode === "login" ? login : register}
        onToggleMode={() => {
          setAuthMode((prev) => (prev === "login" ? "register" : "login"));
          setAuthMessage("");
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Aprende a jugar LOL</h1>
        <p>Busca campeones y mira builds recomendadas por elo.</p>
        <div className="header-actions">
          <button type="button" onClick={logout}>
            Cerrar sesion
          </button>
        </div>
      </header>

      <ChampionSearchBar value={search} onChange={setSearch} />

      {error && <p className="status-message error">{error}</p>}

      <PlayerSearchPanel
        riotForm={riotForm}
        setRiotForm={setRiotForm}
        playerData={playerData}
        onSearchMatches={searchPlayerMatches}
      />

      <ChampionAdmin />

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
      {selectedChampion && (
        <ChampionBuildManager
          champion={selectedChampion}
          customBuilds={customBuilds}
          onSaved={() => {
            refreshChampion();
            refreshChampionBuilds();
          }}
        />
      )}
    </div>
  );
}

export default App;
