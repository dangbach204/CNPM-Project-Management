import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware";
import {
  getMyProject,
  getStundentOverview,
  studentJoinProject,
  submitProject,
  studentGetProjects,
  getMySubmissions,
} from "../controllers/studentController";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("student"));

// Overview & Projects
router.get("/overview", getStundentOverview);
router.get("/projects", studentGetProjects);
router.get("/my-project", getMyProject);

// Project Actions
router.patch("/join-project/:projectId", studentJoinProject);

// Submissions
router.post("/submit-project/:projectId", submitProject);
router.get("/my-submissions", getMySubmissions);

export default router;
