import mongoose from "mongoose";
import { Chat } from "../types";

const chatSchema = new mongoose.Schema<Chat>({
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true,
  },
  messages:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Message",
  },

  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  attachment:{
    type: mongoose.Schema.Types.ObjectId,
   ref: "Attachment"
 }
 
},{timestamps:true});

// chatSchema.ts
// ✅ Static method for private chats - check if user is in this chat
chatSchema.statics.isMember = async function(userId: string, chatId: string) {
  const chat = await this.findOne({ 
    _id: chatId, 
    members: { $in: [userId] } 
  });
  return !!chat;
};

// ─── Static Method: Find existing 1-on-1 chat ───
chatSchema.statics.findDirectChat = async function (userA: string, userB: string) {
  // 'this' refers to the Model (ChatModel) in static methods
  return this.findOne({members:{$all:[userA,userB]}})
  };
  
  
export const ChatSchema =mongoose.models.Chat || mongoose.model("Chat", chatSchema);
