import { useEffect, useMemo, useState, useCallback, memo } from "react";
import {
  createChampionBuild,
  updateChampionBuild,
  deleteChampionBuild,
} from "../services/champions.service";

const formatItems = (items = []) => items.join(", ");
const parseItems = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function ChampionBuildManager({ champion, customBuilds, onSaved }) {
  const [elo, setElo] = useState("");
  const [starting, setStarting] = useState("");
  const [core, setCore] = useState("");
  const [situational, setSituational] = useState("");
  const [boots, setBoots] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const customElos = useMemo(() => Object.keys(customBuilds || {}), [customBuilds]);

  useEffect(() => {
    setElo("");
    setStarting("");
    setCore("");
    setSituational("");
    setBoots("");
    setStatusMessage("");
  }, [champion]);

  const loadFromBuild = useCallback((selectedElo, build) => {
    setElo(selectedElo);
    setStarting(formatItems(build.starting));
    setCore(formatItems(build.core));
    setSituational(formatItems(build.situational));
    setBoots(formatItems(build.boots));
    setStatusMessage("");
  }, []);

  const handleSave = useCallback(async (event) => {
    event.preventDefault();
    if (!elo.trim()) {
      setStatusMessage("El campo Elo es obligatorio.");
      return;
    }

    const newBuild = {
      elo: elo.trim(),
      starting: parseItems(starting),
      core: parseItems(core),
      situational: parseItems(situational),
      boots: parseItems(boots),
    };

    setLoading(true);
    setStatusMessage("");

    try {
      if (customBuilds[elo.trim()]) {
        await updateChampionBuild(champion.id, elo.trim(), newBuild);
        setStatusMessage("Build actualizado correctamente.");
      } else {
        await createChampionBuild(champion.id, newBuild);
        setStatusMessage("Build creado correctamente.");
      }
      onSaved?.();
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setLoading(false);
    }
  }, [elo, starting, core, situational, boots, customBuilds, champion, onSaved]);

  const handleDelete = useCallback(async (deleteElo) => {
    const targetElo = deleteElo?.trim() || elo.trim();
    if (!targetElo) {
      setStatusMessage("Selecciona un elo para borrar primero.");
      return;
    }

    if (!customBuilds[targetElo]) {
      setStatusMessage("Solo puedes borrar builds personalizados existentes.");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    try {
      await deleteChampionBuild(champion.id, targetElo);
      setStatusMessage("Build eliminado correctamente.");
      setElo("");
      setStarting("");
      setCore("");
      setSituational("");
      setBoots("");
      onSaved?.();
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setLoading(false);
    }
  }, [elo, customBuilds, champion, onSaved]);

  return (
    <section className="panel">
      <h2 className="section-title">Gestión de Builds de Usuario</h2>
      <p>
        Aquí puedes crear o editar builds personalizadas para {champion.name}. Usa comas para separar los objetos.
      </p>

      {customElos.length > 0 ? (
        <div className="matches-list">
          <strong>Mis builds guardadas:</strong>
          {customElos.map((customElo) => (
            <div key={customElo} className="match-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{customElo}</span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button type="button" onClick={() => loadFromBuild(customElo, customBuilds[customElo])}>
                  Editar
                </button>
                <button type="button" onClick={() => handleDelete(customElo)}>
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No tienes builds personales para este campeon aun.</p>
      )}

      <form className="modal-form" onSubmit={handleSave}>
        <input
          className="search-input"
          placeholder="Elo (ej: Platino-Oro)"
          value={elo}
          onChange={(e) => setElo(e.target.value)}
        />
        <textarea
          className="search-input"
          placeholder="Items de inicio separados por coma"
          value={starting}
          onChange={(e) => setStarting(e.target.value)}
        />
        <textarea
          className="search-input"
          placeholder="Core separados por coma"
          value={core}
          onChange={(e) => setCore(e.target.value)}
        />
        <textarea
          className="search-input"
          placeholder="Situacionales separados por coma"
          value={situational}
          onChange={(e) => setSituational(e.target.value)}
        />
        <textarea
          className="search-input"
          placeholder="Botas separados por coma"
          value={boots}
          onChange={(e) => setBoots(e.target.value)}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="submit" disabled={loading}>
            {customBuilds[elo.trim()] ? "Actualizar build" : "Crear build"}
          </button>
          <button type="button" disabled={loading} onClick={() => handleDelete()}>
            Borrar build
          </button>
        </div>
      </form>

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </section>
  );
}

export default memo(ChampionBuildManager);
