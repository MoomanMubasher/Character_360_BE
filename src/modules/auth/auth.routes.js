import { Router } from "express";

const router = Router();

router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint placeholder" });
});

export default router;
