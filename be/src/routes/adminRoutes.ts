import express from "express";
import { createUser, deleteUser, updateUserInfo } from "../controllers/adminUserController";
import { getAdminOverview, getUsersManagement } from "../controllers/adminController";
import { getProjectsManagement } from "../controllers/adminProjectController";


const router = express.Router();

router.get("/overview", getAdminOverview);
router.get("/users-management", getUsersManagement);
router.post("/create-user", createUser);
router.delete("/delete-user/:userId", deleteUser);
router.patch("/update-user-info/:userId", updateUserInfo);
router.get("/projects-management", getProjectsManagement);

export default router;