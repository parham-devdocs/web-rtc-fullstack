
import { Router} from "express";

import {DownloadFile} from "../controllers/file";
import { verifyAccessToken } from "../middlewares/verifyToken";

const router = Router();




router.get("/:url/:id",verifyAccessToken(),DownloadFile)
export default router;