import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import { camelCaseResponse } from "./middlewares/snakeToCamel";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(camelCaseResponse);
// test endpoint
app.get("/", async (req, res) => {});

export default app;
