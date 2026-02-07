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
import { validateBody, validateParams } from "../middlewares/validate";
import {
  projectIdParamSchema,
  submitProjectSchema,
} from "../validators/schemas";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("student"));

// Overview & Projects
router.get("/overview", getStundentOverview);
router.get("/projects", studentGetProjects);
router.get("/my-project", getMyProject);

// Project Actions
router.patch(
  "/join-project/:projectId",
  validateParams(projectIdParamSchema),
  studentJoinProject,
);

// Submissions
router.post(
  "/submit-project/:projectId",
  validateParams(projectIdParamSchema),
  validateBody(submitProjectSchema),
  submitProject,
);
router.get("/my-submissions", getMySubmissions);

export default router;
