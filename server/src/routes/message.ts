
import { Router} from "express";

import {DeleteMessage, markChatMessageAsRead } from "../controllers/message";
import upload from "../middlewares/multer";

const router = Router();




router.delete("/",DeleteMessage)
router.put("/read", markChatMessageAsRead);

export default router;