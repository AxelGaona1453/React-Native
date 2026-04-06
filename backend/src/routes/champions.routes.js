import { Router } from "express";
import {
  getChampions,
  getChampionById,
} from "../controllers/champions.controller.js";

const router = Router();

router.get("/champions", getChampions);
router.get("/champions/:id", getChampionById);

export default router;
