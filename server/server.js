import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectMongoDB from "./database/db.js";
import userRoutes from "./routes/userRoutes.js";
import milestoneRoutes from "./routes/milestoneRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import checkAvailability from "./routes/checkAvailability.js";

const app = express();

app.use(cors());
app.use(express.json());

connectMongoDB();

app.use("/availability", checkAvailability);
app.use("/user", userRoutes);
app.use("/milestone", milestoneRoutes);
app.use("/posts", postRoutes);
app.use("/event", eventRoutes);
app.use("/job", jobRoutes);

app.listen(process.env.PORT, () => {
  console.log(`server running at port: ${process.env.PORT}`);
});
