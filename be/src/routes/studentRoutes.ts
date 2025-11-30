import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware";
import {
  getMyProject,
  getStundentOverview,
  studentGetAllProjects,
  studentJoinProject,
  submitProject,
} from "../controllers/studentController";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("student"));

router.get("/overview", getStundentOverview);
router.get("/projects", studentGetAllProjects);
router.patch("/join-project/:projectId", studentJoinProject);
router.patch("/submit-project/:projectId", submitProject);
router.get("/get-my-project", getMyProject);

export default router;
