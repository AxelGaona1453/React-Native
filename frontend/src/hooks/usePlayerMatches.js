import { useState, useCallback } from "react";
import { getPlayerMatches } from "../services/champions.service";

function usePlayerMatches() {
  const [riotForm, setRiotForm] = useState({ gameName: "", tagLine: "" });
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState(null);

  const searchPlayerMatches = useCallback(async (event) => {
    event.preventDefault();

    try {
      const result = await getPlayerMatches(riotForm.gameName, riotForm.tagLine);
      setPlayerData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setPlayerData(null);
    }
  }, [riotForm.gameName, riotForm.tagLine]);

  return {
    riotForm,
    setRiotForm,
    playerData,
    error,
    searchPlayerMatches,
  };
}

export default usePlayerMatches;
