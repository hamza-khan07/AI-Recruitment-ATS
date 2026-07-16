import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import companyRouter from "./routes/company.routes.js";
import adminRouter from "./routes/admin.routes.js";
import jobRouter from "./routes/job.routes.js";
import { candidateRouter } from "./routes/candidate.routes.js";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true, allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

import { uploadRouter } from "./routes/upload.routes.js";
import path from "path";

app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

app.use(`${env.apiPrefix}/auth`, authRouter);
app.use(`${env.apiPrefix}/companies`, companyRouter);
app.use(`${env.apiPrefix}/admin`, adminRouter);
app.use(`${env.apiPrefix}/jobs`, jobRouter);
app.use(`${env.apiPrefix}/candidates`, candidateRouter);
app.use(`${env.apiPrefix}/upload`, uploadRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use(errorMiddleware);

export default app;
// Trigger restart 5