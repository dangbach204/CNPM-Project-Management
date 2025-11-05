import express from "express";
import { createUser, deleteUser, modifyUserInfo } from "../controllers/adminUserController";
import { getAdminOverview, getUsersManagement } from "../controllers/adminController";


const router = express.Router();

router.get("/overview", getAdminOverview);
router.get("/users-management", getUsersManagement);
router.post("/create-user", createUser);
router.delete("/delete-user/:userId", deleteUser);
router.patch("/update-user/:userId", modifyUserInfo);

export default router;