import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const fixIndexes = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Drop and recreate all indexes for the User collection
    console.log("🔄 Dropping existing indexes...");
    await User.collection.dropIndexes();
    console.log("✅ Dropped all indexes");

    // Recreate indexes
    console.log("🔄 Creating fresh indexes...");
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log("✅ Fresh unique index created for email field");

    console.log("✅ Index repair complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing indexes:", error.message);
    process.exit(1);
  }
};

fixIndexes();
