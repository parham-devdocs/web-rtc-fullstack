import { NextFunction, Request, Response } from "express";
import upload from "./multer";

const requirePicture = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      error: "Picture is required!",
      message: "Please provide an image file",
    });
  }
  next();
};

export default requirePicture;
