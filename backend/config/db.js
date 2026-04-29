import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", {
      message: error.message,
      mongoUri: process.env.MONGO_URI ? 'SET' : 'NOT SET'
    });
    process.exit(1);
  }
};

export default connectDB;