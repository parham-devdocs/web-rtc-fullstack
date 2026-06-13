import mongoose from "mongoose";
import { Group } from "../types";



const groupSchema = new mongoose.Schema<Group>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: false,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
      required: true
    },
    avatarURL: {
      type: String,
      default: "",
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
  },
  
  {
    timestamps: true,
  
  }
);


// Static methods (call on Model directly)
// Fix isUserAdmin - check specific group
groupSchema.statics.isUserAdmin = async function(userId: string, groupId: string) {
  const group = await this.findOne({ _id: groupId, admin: userId });
  return !!group; 
};

// Fix isMember - check specific group
groupSchema.statics.isMember = async function(userId: string, groupId: string) {
  const group = await this.findOne({ 
    _id: groupId, 
    members: { $in: [userId] } 
  });
  console.log({group})
  return !!group; 
};

export const GroupModel = mongoose.model("Group", groupSchema);