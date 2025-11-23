import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware";
import { get } from "http";
import { getTeacherOverview } from "../controllers/teacherController";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("teacher"));

router.get("/overview/", getTeacherOverview);

export default router;