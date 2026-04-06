import {
  findChampionById,
  searchChampions,
} from "../services/champions.service.js";

export const getChampions = async (req, res) => {
  try {
    const search = req.query.search || "";
    const champions = await searchChampions(search);
    return res.status(200).json({ champions });
  } catch (error) {
    console.error("Error al obtener campeones:", error);
    return res.status(500).json({
      error: "No se pudieron obtener campeones desde Data Dragon",
    });
  }
};

export const getChampionById = async (req, res) => {
  try {
    const champion = await findChampionById(req.params.id);

    if (!champion) {
      return res.status(404).json({ error: "Campeon no encontrado" });
    }

    return res.status(200).json({ champion });
  } catch (error) {
    console.error("Error al obtener detalle del campeon:", error);
    return res.status(500).json({
      error: "No se pudo obtener el detalle del campeon",
    });
  }
};
