import { Router } from "express";
import { verifyToken } from "../controllers/authController.js";
import { createProject, getProject, updateProject, getProjectsByUser } from "../controllers/projectController.js";

const router = Router();

router.use(verifyToken);

router.post("/", createProject);
router.get("/", getProjectsByUser);
router.get("/:id", getProject);
router.put("/:id", updateProject);

export default router;
