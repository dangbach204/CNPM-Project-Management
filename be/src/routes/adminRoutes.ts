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
import { validateBody, validateParams } from "../middlewares/validate";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validators/schemas";
import { emailQueue } from "../utils/emailQueue";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("admin"));

router.get("/overview", getAdminOverview);
router.get("/users-management", getUsersManagement);
router.post(
  "/create-user",
  upload.single("avatar"),
  validateBody(createUserSchema),
  createUser,
);
router.delete(
  "/delete-user/:userId",
  validateParams(userIdParamSchema),
  deleteUser,
);
router.patch(
  "/update-user-info/:userId",
  upload.single("avatar"),
  validateParams(userIdParamSchema),
  updateUserInfo,
);
router.get("/projects-management", getProjectsManagement);
router.delete("/delete-project/:projectId", deleteProject);
router.patch("/update-project/:projectId", updateProjectInfo);
router.get("/logs-overview", getLogsOverview);

// Email queue status endpoint for monitoring
router.get("/system/email-queue", (req, res) => {
  res.json(emailQueue.getStatus());
});

export default router;
