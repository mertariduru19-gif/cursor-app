import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { AppError } from "./utils/appError";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", routes);

app.use((req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.path} not found`, 404));
});

app.use(errorHandler);

export { app };
