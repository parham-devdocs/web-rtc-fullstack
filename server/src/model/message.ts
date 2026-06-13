import mongoose from "mongoose";
import { Message, User } from "../types";

const messageSchema = new mongoose.Schema<Message>({
    sender: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    content: {
        type: String,
        required: false  // Remove required constraint
    },
    type: {
        type: String,
        default: "text",
        enum: ["text", "file", "voice"]  // Add enum for validation
    },
    file: {
        type: mongoose.Types.ObjectId,
        required: false,
        ref: "Attachment"
    },
    seen: {
        type: Boolean,
        required: true,
        default: false
    },
}, { timestamps: true });

// Pre-save middleware for validation
messageSchema.pre('save', function(next) {
    if (this.type === 'text') {
        if (!this.content || this.content.trim() === '') {
            new Error('Content is required for text messages')
        }
    } 
    else if (this.type === 'file' || this.type === 'voice') {
        if (!this.file) {
            new Error(`FileId is required for ${this.type} messages`)
        }
        // Optionally make content not required for file/voice
        this.content = this.content || ''; // Set empty string if not provided
    }
    else {
        new Error('Invalid message type')
    }
    
    next
});

export const MessageModel = mongoose.model("Message", messageSchema);