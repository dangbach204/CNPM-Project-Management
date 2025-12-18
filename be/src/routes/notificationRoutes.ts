import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Notification routes working!" });
});

router.get("/", authMiddleware, getNotifications);
router.patch("/:id/read", authMiddleware, markAsRead);
router.patch("/read-all", authMiddleware, markAllAsRead);
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
