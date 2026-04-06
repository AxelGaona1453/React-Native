import { useEffect, useState } from "react";
import { getChampionBuilds } from "../services/champions.service";

function useChampionBuilds(championId) {
  const [customBuilds, setCustomBuilds] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadChampionsBuilds = async () => {
    if (!championId) {
      setCustomBuilds({});
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const builds = await getChampionBuilds(championId);
      setCustomBuilds(builds || {});
    } catch (err) {
      setError(err.message || "No se pudieron cargar los builds personalizados.");
      setCustomBuilds({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChampionsBuilds();
  }, [championId]);

  return {
    customBuilds,
    loading,
    error,
    refresh: loadChampionsBuilds,
  };
}

export default useChampionBuilds;
