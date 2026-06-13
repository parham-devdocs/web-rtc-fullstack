import { Request, Response } from "express";
import { UserModel } from "../model/user";
import { Message } from "../types";
import { GroupModel } from "../model/group";
import { MessageModel } from "../model/message";
import mongoose from "mongoose";
import { ChatSchema } from "../model/chat";
import { AttachmentModel } from "../model/attachment";




export async function DeleteMessage(
  req: Request,
  res: Response
) {
  try {
    const { messageId}  = req.body;

    // 1. Find the message first (to check existence or ownership)
    const message = await MessageModel.findById(messageId);

    if (!message) {
       res.status(404).json({ message: "Message not found" });
       return
    }

    // 2. Perform the deletion
    await MessageModel.findByIdAndDelete(messageId);

    // 3. Return a success response
    // Using 200 (OK) or 204 (No Content) is standard for deletions
     res.status(200).json({ 
      message: "Message deleted successfully",
      deletedId: messageId 
    });
return
  } catch (error) {
    console.error("Delete message error:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
}


export async function markChatMessageAsRead (
  req: Request,
  res: Response
) {
  try {
    const { messageId } = req.body;

    // 1. Find the message first (to check existence or ownership)
    const message = await MessageModel.findById(messageId);

    if (!message) {
       res.status(404).json({ message: "Message not found" });
       return
    }

    // 2. Perform the deletion
    await MessageModel.findByIdAndUpdate(messageId,{seen:true});

    // 3. Return a success response
    // Using 200 (OK) or 204 (No Content) is standard for deletions
     res.status(200).json({ 
      message: "Message read successfully",
      updatedId: messageId 
    });
return
  } catch (error) {
    console.error("Delete message error:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
}



