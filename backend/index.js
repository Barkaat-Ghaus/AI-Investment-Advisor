import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import financeRoutes from "./routes/financeRoutes.js";

dotenv.config();

const app = express();

// Middleware


app.use(cors({
  // Replace with your actual Netlify URL
  origin: 'https://ai-investing-advisor.netlify.app/', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001; 
// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);

app.use("/api/chat", chatRoutes);

// app.get("/", (req, res) => {
//  res.send("API is running...");
// });

// app.post("/login", (req, res) => {
//   console.log(req.body);
//    res.send("Login data received");
// });

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));










