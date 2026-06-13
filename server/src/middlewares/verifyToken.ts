import { Response, Request, NextFunction } from "express";
import httpErrors from "http-status-codes";
import jwt from "jsonwebtoken";

export const verifyAccessToken = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    console.log(req.cookies)
    console.log("Cookies received:", req.cookies);
    console.log("Access Token:", token);

    if (!token) {
      res.status(401).json({ message: "not authorized" });
      return;
    }

    const privateKey = process.env.JWT_ACCESS_TOKEN;

    if (!privateKey) {
      res.status(httpErrors.INTERNAL_SERVER_ERROR).json({
        message: "JWT secret not configured on server",
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, privateKey) as any;
      (req as any).user = decoded.payload;
      console.log("Decoded user:", (req as any).user);
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  };
};