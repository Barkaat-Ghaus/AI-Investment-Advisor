import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.warn("[Auth] No token provided");
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error("[Auth] JWT_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.warn("[Auth] Token verification failed:", error.message);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

export default protect;
