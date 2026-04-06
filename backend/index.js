import express from "express";
import cors from "cors";
import "dotenv/config";
import championsRouter from "./src/routes/champions.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import lolRouter from "./src/routes/lol.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Backend LoL activo",
    endpoints: [
      "/api/health",
      "/api/champions",
      "/api/champions/:id",
      "GET /api/champions/:id/builds",
      "POST /api/champions/:id/builds",
      "PUT /api/champions/:id/builds/:elo",
      "DELETE /api/champions/:id/builds/:elo",
      "POST /api/champions",
      "PUT /api/champions/:id",
      "DELETE /api/champions/:id",
    ],
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "lol-champions-api" });
});

app.use("/api", championsRouter);
app.use("/api/auth", authRouter);
app.use("/api/lol", lolRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});