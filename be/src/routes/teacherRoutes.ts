import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware";
import { createProject, deleteProject, getSubmissions, getTeacherOverview, updateProjectInfo } from "../controllers/teacherController";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("teacher"));

router.get("/overview/", getTeacherOverview);
router.post("/create-project", createProject);
router.patch("/update-project/:projectId", updateProjectInfo);
router.delete("/delete-project/:projectId", deleteProject);
router.get("/submissions", getSubmissions);

export default router;