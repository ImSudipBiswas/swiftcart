import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import categoryRouter from "./routes/category";
import colorRouter from "./routes/color";
import sizeRouter from "./routes/size";

import { PORT, CORS_OPTIONS } from "./utils/constants";

dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));
app.use(morgan("dev"));

app.use("/api/auth/v1", authRouter);
app.use("/api/user/v1", userRouter);
app.use("/api/category/v1", categoryRouter);
app.use("/api/color/v1", colorRouter);
app.use("/api/size/v1", sizeRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
