import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import projectRouter from "./routes/projectRoutes.js";

function loadConfig() {
    const required = ["MONGODB_URI", "JWT_SECRET", "ORIGINS", "OPENROUTER_API_KEY"];
    const missing = required.filter((key) => !process.env[key]?.trim());

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    if (process.env.JWT_SECRET.trim().length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters long.");
    }

    const origins = process.env.ORIGINS
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (origins.length === 0) {
        throw new Error("ORIGINS must contain at least one allowed frontend origin.");
    }

    return { origins };
}

const { origins } = loadConfig();
const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: origins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

await connectToDatabase();

app.get("/", (_req, res) => res.send("Server is Live!"));
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);

// Centralized error handler: keep implementation details in server logs.
app.use((err, _req, res, _next) => {
    console.error("[Error]", err);
    if (res.headersSent) return;

    if (err?.type === "entity.too.large") {
        return res.status(413).json({ error: "Request body is too large." });
    }

    res.status(500).json({ error: "An unexpected server error occurred." });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
