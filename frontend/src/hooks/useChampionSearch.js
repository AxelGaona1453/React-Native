import { useEffect, useState } from "react";
import { getChampions } from "../services/champions.service";

function useChampionSearch(search) {
  const [champions, setChampions] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChampions = async () => {
      setListLoading(true);
      setError(null);

      try {
        const result = await getChampions(search);
        setChampions(result);
      } catch {
        setError("No se pudieron cargar los campeones. Revisa el backend.");
      } finally {
        setListLoading(false);
      }
    };

    const debounce = setTimeout(loadChampions, 250);
    return () => clearTimeout(debounce);
  }, [search]);

  return {
    champions,
    listLoading,
    error,
    setError,
  };
}

export default useChampionSearch;
