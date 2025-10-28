import express from "express";
import { getAdminOverview, getUsersManagement } from "../controllers/adminController";
import { createUser } from "../controllers/adminUserController";


const router = express.Router();

router.get("/overview", getAdminOverview);
router.get("/users-management", getUsersManagement);
router.post("/create-user", createUser);

export default router;