import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import { camelCaseResponse } from "./middlewares/snakeToCamel";
import teacherRoutes from "./routes/teacherRoutes";
import studentRoutes from "./routes/studentRoutes";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://cnpm-project-management.vercel.app/",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(camelCaseResponse);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
// test endpoint
app.get("/", async (req, res) => {});

export default app;
