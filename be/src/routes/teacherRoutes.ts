import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware";
import { createProject, deleteProject, getSubmissions, getTeacherOverview, teacherGradeSubmission, teacherUpdateProjectInfo } from "../controllers/teacherController";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("teacher"));

router.get("/overview", getTeacherOverview);
router.post("/create-project", createProject);
router.patch("/update-project/:projectId", teacherUpdateProjectInfo);
router.delete("/delete-project/:projectId", deleteProject);
router.get("/submissions", getSubmissions);
router.patch("/grade-submission/:submissionId", teacherGradeSubmission);

export default router;