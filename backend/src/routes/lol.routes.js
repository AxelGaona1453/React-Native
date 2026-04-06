import { Router } from "express";
import { getPlayerRecentMatches } from "../controllers/lol.controller.js";

const router = Router();

router.get("/player-matches", getPlayerRecentMatches);

export default router;
