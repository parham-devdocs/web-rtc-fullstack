
import { Router } from "express";

import { findUsersWithUserId } from "../controllers/user";
import upload from "../middlewares/multer";

const router = Router();

router.get("/", findUsersWithUserId);
export default router;