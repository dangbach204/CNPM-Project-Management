import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware";
import { createProject, deleteProject, getSubmissions, getTeacherOverview, teacherGradeSubmission, teacherUpdateProjectInfo, updateProjectInfo } from "../controllers/teacherController";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("teacher"));

router.get("/overview", getTeacherOverview);
router.post("/create-project", createProject);
router.patch("/update-project/:projectId", updateProjectInfo);
router.delete("/delete-project/:projectId", deleteProject);
router.get("/submissions", getSubmissions);
router.patch("/grade-submission/:submissionId", teacherGradeSubmission);
router.patch("/update-project/:projectId", teacherUpdateProjectInfo);

export default router;