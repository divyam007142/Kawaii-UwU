import { Router } from "express";
import { readFile } from "fs/promises";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const raw  = await readFile("/tmp/kawaii-stats.json", "utf-8");
    const data = JSON.parse(raw);
    res.json(data);
  } catch {
    res.status(503).json({ error: "Bot stats not yet available — is the bot running?" });
  }
});

export default router;
