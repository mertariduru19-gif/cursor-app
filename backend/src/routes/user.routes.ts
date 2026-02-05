import { Router } from "express";
import { meHandler } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", authenticate, meHandler);

export default router;
