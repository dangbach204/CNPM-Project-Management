import dotenv from "dotenv";
dotenv.config();

// Validate environment variables BEFORE importing app
// This ensures the server fails fast if critical config is missing
import "./config/env";

import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
