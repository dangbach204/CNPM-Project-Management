import express from "express";
import {
  createUser,
  deleteUser,
  updateUserInfo,
} from "../controllers/adminUserController";
import {
  getAdminOverview,
  getLogsOverview,
  getUsersManagement,
} from "../controllers/adminController";
import {
  deleteProject,
  getProjectsManagement,
  updateProjectInfo,
} from "../controllers/adminProjectController";
import { authMiddleware, authorize } from "../middlewares/authMiddleware";
import { upload } from "../config/cloudinary";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("admin"));

router.get("/overview", getAdminOverview);
router.get("/users-management", getUsersManagement);
router.post("/create-user", upload.single("avatar"), createUser);
router.delete("/delete-user/:userId", deleteUser);
router.patch(
  "/update-user-info/:userId",
  upload.single("avatar"),
  updateUserInfo
);
router.get("/projects-management", getProjectsManagement);
router.delete("/delete-project/:projectId", deleteProject);
router.patch("/update-project/:projectId", updateProjectInfo);
router.get("/logs-overview", getLogsOverview);
export default router;
