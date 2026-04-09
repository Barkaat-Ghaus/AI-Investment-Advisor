import express from "express";
import { getTopPerformingStocks } from "../controllers/financeControllers.js";

const router = express.Router();

router.get("/top-performers", getTopPerformingStocks);

export default router;
