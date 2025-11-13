import express from "express";
import { createUser, deleteUser, updateUserInfo } from "../controllers/adminUserController";
import { getAdminOverview, getUsersManagement } from "../controllers/adminController";
import { deleteProject, getProjectsManagement, updateProjectInfo } from "../controllers/adminProjectController";


const router = express.Router();

router.get("/overview", getAdminOverview);
router.get("/users-management", getUsersManagement);
router.post("/create-user", createUser);
router.delete("/delete-user/:userId", deleteUser);
router.patch("/update-user-info/:userId", updateUserInfo);
router.get("/projects-management", getProjectsManagement);
router.delete("/delete-project/:projectId", deleteProject);
router.patch("/update-project/:projectId", updateProjectInfo);
export default router;