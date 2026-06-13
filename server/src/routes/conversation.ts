

import { Router} from "express";
import { getConversationMetaData } from "../controllers/conversation";
const router = Router();


router.get("/:id/metadata", getConversationMetaData);

export default router;