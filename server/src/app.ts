import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import companyRoutes from "./routes/company.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/applications.routes";

const app = express();

app.set("trust proxy", 1);

// Security
app.use(helmet());

app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    })
);

// Rate limiting
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            error: "Too many requests, please try again later.",
        },
    })
);

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// Logging
if (env.NODE_ENV !== "test") {
    app.use(
        morgan(
            env.NODE_ENV === "development"
                ? "dev"
                : "combined"
        )
    );
}

// Static files
app.use("/uploads", express.static(env.UPLOAD_DIR));

// Health
app.get("/health", (_req, res) => {
    res.json({
        success: true,
        message: "JobSphere API is running",
        timestamp: new Date(),
    });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);

// 404
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
    });
});

// Global error handler
app.use(errorHandler);

export default app;