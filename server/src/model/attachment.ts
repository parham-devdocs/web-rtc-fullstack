
import mongoose from "mongoose";
import { Attachment, Message, User } from "../types";

const attachmentSchema = new mongoose.Schema<Attachment>({

   
filename:String,


originalName:String,


mimeType:String,


size:Number,

duration:{
    type:Number,
    required:false
},

url:String


},
{timestamps:true});

export const AttachmentModel = mongoose.model("Attachment", attachmentSchema);
