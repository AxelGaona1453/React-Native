import { Router } from "express";
import {
  getChampions,
  getChampionById,
  getChampionBuilds,
  createChampionBuild,
  updateChampionBuild,
  deleteChampionBuild,
  createChampion,
  updateChampion,
  deleteChampion,
} from "../controllers/champions.controller.js";

const router = Router();

router.get("/champions", getChampions);
router.get("/champions/:id", getChampionById);
router.get("/champions/:id/builds", getChampionBuilds);
router.post("/champions/:id/builds", createChampionBuild);
router.put("/champions/:id/builds/:elo", updateChampionBuild);
router.delete("/champions/:id/builds/:elo", deleteChampionBuild);
router.post("/champions", createChampion);
router.put("/champions/:id", updateChampion);
router.delete("/champions/:id", deleteChampion);

export default router;
