import mongoose from "mongoose";
import { User } from "../types";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema<User>({
  username: {
      type:String,
      required:true,
      trim:true,
      
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim:true,
    lowercase:true
  },
  isAdmin: {
    type:Boolean,
    default:false
  },
  password: {
    type: String,
    required: true,
  },
  attachment:{
    type:[mongoose.Types.ObjectId],
    ref:"Attachment"
},
},
{timestamps:true}
);

export const UserModel = mongoose.model("User", userSchema);
