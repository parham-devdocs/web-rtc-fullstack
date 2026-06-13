import dotenv from "dotenv";
import { Router } from "express";
import userRoute from "./user";

import messageRoute from "./message";
import conversationRoute from "./conversation";
import fileRoute from "./file";
import { verifyAccessToken } from "../middlewares/verifyToken";
const router = Router();
dotenv.config();

router.use("/file",verifyAccessToken(),fileRoute)
router.use("/user", verifyAccessToken(), userRoute);
router.use("/message", verifyAccessToken(), messageRoute);
router.use("/conversation", verifyAccessToken(), conversationRoute );

export default router;
