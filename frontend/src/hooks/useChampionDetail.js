import { useEffect, useState, useCallback } from "react";
import { getChampionById } from "../services/champions.service";

function useChampionDetail(champions) {
  const [selectedChampionId, setSelectedChampionId] = useState("");
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!champions.length) {
      return;
    }

    if (!selectedChampionId) {
      setSelectedChampionId(champions[0].id);
    }
  }, [champions, selectedChampionId]);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!selectedChampionId) {
      setSelectedChampion(null);
      return;
    }

    let active = true;
    const loadChampion = async () => {
      setDetailLoading(true);
      setError(null);

      try {
        const champion = await getChampionById(selectedChampionId);
        if (active) {
          setSelectedChampion(champion);
        }
      } catch {
        if (active) {
          setError("No se pudo cargar el detalle del campeon.");
        }
      } finally {
        if (active) {
          setDetailLoading(false);
        }
      }
    };

    loadChampion();
    return () => {
      active = false;
    };
  }, [selectedChampionId, refreshKey]);

  const refreshChampion = useCallback(() => setRefreshKey((prev) => prev + 1), []);

  return {
    selectedChampionId,
    selectedChampion,
    detailLoading,
    error,
    setSelectedChampionId,
    setSelectedChampion,
    refreshChampion,
  };
}

export default useChampionDetail;
