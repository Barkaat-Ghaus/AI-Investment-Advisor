import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("[Signup] Received request:", { name, email, passwordLength: password?.length });

    // Validate input
    if (!name || !email || !password) {
      console.warn("[Signup] Missing required fields", { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn("[Signup] Invalid email format:", email);
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
      console.warn("[Signup] Password too short for:", email);
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.warn("[Signup] User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("[Signup] Password hashed successfully");

    // Create user
    const user = await User.create({ name, email, password: hashedPassword });
    console.log("[Signup] User created:", user._id);
    
    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("[Signup] JWT_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error: JWT_SECRET not set" });
    }
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    console.log("[Signup] Token generated successfully");

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("[Signup] Error:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Signup failed", 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { details: error.code })
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[Login] Received request:", { email });

    if (!email || !password) {
      console.warn("[Login] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("[Login] User not found:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("[Login] Password mismatch for:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[Login] JWT_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error: JWT_SECRET not set" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    console.log("[Login] Successful for:", email);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("[Login] Error:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Verify token validity — called on app load to confirm session is still active
export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    res.status(200).json({ valid: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(401).json({ message: "Token verification failed", error: error.message });
  }
};
