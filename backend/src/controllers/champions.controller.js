import {
  findChampionById,
  searchChampions,
  getChampionBuilds as getChampionBuildsService,
  createChampionBuild as createChampionBuildService,
  updateChampionBuild as updateChampionBuildService,
  deleteChampionBuild as deleteChampionBuildService,
  createChampion as createChampionService,
  updateChampion as updateChampionService,
  deleteChampion as deleteChampionService,
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

export const getChampionBuilds = async (req, res) => {
  try {
    const builds = await getChampionBuildsService(req.params.id);
    if (builds === null) {
      return res.status(404).json({ error: "Campeon no encontrado" });
    }

    return res.status(200).json({ builds });
  } catch (error) {
    console.error("Error al obtener builds del campeon:", error);
    return res.status(500).json({ error: "No se pudieron obtener los builds" });
  }
};

export const createChampionBuild = async (req, res) => {
  try {
    const build = await createChampionBuildService(req.params.id, req.body);
    return res.status(201).json({ build });
  } catch (error) {
    console.error("Error al crear build del campeon:", error);
    return res.status(400).json({ error: error.message || "No se pudo crear el build" });
  }
};

export const updateChampionBuild = async (req, res) => {
  try {
    const build = await updateChampionBuildService(req.params.id, req.params.elo, req.body);

    if (!build) {
      return res.status(404).json({ error: "Build custom no encontrado" });
    }

    return res.status(200).json({ build });
  } catch (error) {
    console.error("Error al actualizar build del campeon:", error);
    return res.status(400).json({ error: error.message || "No se pudo actualizar el build" });
  }
};

export const deleteChampionBuild = async (req, res) => {
  try {
    const removed = await deleteChampionBuildService(req.params.id, req.params.elo);

    if (!removed) {
      return res.status(404).json({ error: "Build custom no encontrado" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar build del campeon:", error);
    return res.status(500).json({ error: "No se pudo eliminar el build" });
  }
};

export const createChampion = async (req, res) => {
  try {
    const champion = await createChampionService(req.body);
    return res.status(201).json({ champion });
  } catch (error) {
    console.error("Error al crear campeon:", error);
    return res.status(400).json({ error: error.message || "No se pudo crear el campeon" });
  }
};

export const updateChampion = async (req, res) => {
  try {
    const champion = await updateChampionService(req.params.id, req.body);

    if (!champion) {
      return res.status(404).json({ error: "Campeon custom no encontrado" });
    }

    return res.status(200).json({ champion });
  } catch (error) {
    console.error("Error al actualizar campeon:", error);
    return res.status(400).json({ error: error.message || "No se pudo actualizar el campeon" });
  }
};

export const deleteChampion = async (req, res) => {
  try {
    const removed = await deleteChampionService(req.params.id);

    if (!removed) {
      return res.status(404).json({ error: "Campeon custom no encontrado" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar campeon:", error);
    return res.status(500).json({ error: "No se pudo eliminar el campeon" });
  }
};
