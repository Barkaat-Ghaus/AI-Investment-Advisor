import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import financeRoutes from "./routes/financeRoutes.js";
import financialProfileRoutes from "./routes/financialProfileRoutes.js";
import advisoryRoutes from "./routes/advisoryRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing environment variables:', missingEnvVars.join(', '));
  console.error('Please set these in your Render dashboard: Environment tab');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://ai-investing-advisor.netlify.app',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3001; 
// Connect MongoDB
connectDB();

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/profile", financialProfileRoutes);
app.use("/api/advisory", advisoryRoutes);

app.use("/api/chat", chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler (MUST be last)
app.use(errorHandler);

// app.get("/", (req, res) => {
//  res.send("API is running...");
// });

// app.post("/login", (req, res) => {
//   console.log(req.body);
//    res.send("Login data received");
// });

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: GET /health`);
  console.log(`🔐 Auth endpoints: POST /api/auth/signup, POST /api/auth/login, GET /api/auth/verify`);
});










