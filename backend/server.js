import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";


import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: "http://localhost:5173", // frontend port
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/", (req, res) => {
	res.send("Backend API is running successfully");
});

app.listen(PORT, () => {
	console.log(
		`  \x1b[32m➜\x1b[0m  \x1b[1mServer:\x1b[0m \x1b[36m http://localhost:\x1b[1m${PORT}\x1b[0m/\x1b[0m`
	);
	connectDB();
});
