import { Router } from "express";
import { listUsers, login, me, register } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.get("/users", listUsers);

export default router;
