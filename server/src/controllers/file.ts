import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { MessageModel } from "../model/message";
import { AttachmentModel } from "../model/attachment";
import { GroupModel } from "../model/group";
import { ChatSchema } from "../model/chat";
import mongoose from "mongoose";

export async function DownloadFile(req: Request, res: Response) {
    const startTime = Date.now();
    console.log("\n========== DOWNLOAD REQUEST START ==========");
    
    try {
        // Should be from params, not body
        const { url, id } = req.params;
        const currentUser = (req as any).user;
        
        console.log("📥 Download Request Details:");
        console.log("  - URL Parameter:", url);
        console.log("  - ID Parameter:", id);
        console.log("  - Current User:", currentUser?._id || currentUser);
        console.log("  - Request IP:", req.ip);
        console.log("  - Request Time:", new Date().toISOString());
        
        if (!url || !id) {
            console.log("❌ Validation Failed: Missing url or id parameter");
            res.status(400).json({ error: 'Missing url or id parameter' });
            return;
        }
        
        console.log("✅ URL and ID parameters present");
        
        // Parse URL: "folder-filename" format
        const firstDashIndex = url.indexOf('-');
        console.log(`🔍 Parsing URL - First dash at index: ${firstDashIndex}`);
        
        if (firstDashIndex === -1) {
            console.log("❌ Invalid URL format - No dash found in:", url);
            res.status(400).json({ error: 'Invalid file URL format' });
            return;
        }
        
        const folder = url.substring(0, firstDashIndex);
        const filename = url.substring(firstDashIndex + 1);
        
        console.log(`📁 Parsed URL:`);
        console.log(`  - Folder: ${folder}`);
        console.log(`  - Filename: ${filename}`);
        
        // Additional validation
        if (!folder || !filename) {
            console.log("❌ Invalid URL - Missing folder or filename after parsing");
            res.status(400).json({ error: 'Invalid file URL format' });
            return;
        }
        
        console.log("✅ URL parsing successful");
        
        // Find attachment by URL
        console.log(`🔍 Searching for attachment with URL: ${url}`);
        const attachment = await AttachmentModel.findOne({ url });
        
        if (!attachment) {
            console.log(`❌ Attachment not found for URL: ${url}`);
            res.status(404).json({ message: "Attachment not found" });
            return;
        }
        
        console.log(`✅ Attachment found:`);
        console.log(`  - Attachment ID: ${attachment._id}`);
        console.log(`  - Filename: ${attachment.originalName || attachment.filename}`);
        console.log(`  - Size: ${attachment.size} bytes`);
        console.log(`  - MimeType: ${attachment.mimeType}`);
        
        // Check authorization - user must be in chat OR group
        let isAuthorized = false;
        console.log(`\n🔐 Checking authorization for user ${currentUser} in ${id}`);
        
        // Check if user is in chat
        if (mongoose.Types.ObjectId.isValid(id)) {
            console.log(`✅ ID ${id} is a valid MongoDB ObjectId`);
            
            // Try to find in Chat
            console.log(`🔍 Searching for chat with ID: ${id}`);
            const userInChat = await ChatSchema.findOne({
                _id: id,
                members: { $in: [currentUser] }
            });
            
            if (userInChat) {
                isAuthorized = true;
                console.log(`✅ User is authorized via CHAT`);
                console.log(`  - Chat ID: ${userInChat._id}`);
                console.log(`  - Members count: ${userInChat.members?.length || 0}`);
            } else {
                console.log(`❌ User not found in chat with ID: ${id}`);
            }
            
            // If not found in chat, try group
            if (!isAuthorized) {
                console.log(`🔍 Searching for group with ID: ${id}`);
                const userInGroup = await GroupModel.findOne({
                    _id: id,
                    members: { $in: [currentUser] }
                });
                
                if (userInGroup) {
                    isAuthorized = true;
                    console.log(`✅ User is authorized via GROUP`);
                    console.log(`  - Group ID: ${userInGroup._id}`);
                    console.log(`  - Group Name: ${userInGroup.name}`);
                    console.log(`  - Members count: ${userInGroup.members?.length || 0}`);
                } else {
                    console.log(`❌ User not found in group with ID: ${id}`);
                }
            }
        } else {
            console.log(`❌ Invalid MongoDB ObjectId: ${id}`);
        }
        
        if (!isAuthorized) {
            console.log(`🚫 Authorization FAILED for user ${currentUser} on resource ${id}`);
            res.status(403).json({ message: "You don't have access to this file" });
            return;
        }
        
        console.log(`✅ Authorization SUCCESSFUL`);
        
        // Security: Prevent directory traversal
        console.log(`\n🛡️ Security Checks:`);
        const safeFolder = path.basename(folder);
        const safeFilename = path.basename(filename);
        
        console.log(`  - Safe Folder: ${safeFolder}`);
        console.log(`  - Safe Filename: ${safeFilename}`);
        
        const filePath = path.join(process.cwd(), 'uploads', safeFolder, safeFilename);
        console.log(`  - Full File Path: ${filePath}`);
        
        // Security: Ensure path is within uploads directory
        const uploadsDir = path.join(process.cwd(), 'uploads');
        console.log(`  - Uploads Directory: ${uploadsDir}`);
        
        if (!filePath.startsWith(uploadsDir)) {
            console.log(`🚫 Path traversal attempt detected!`);
            console.log(`  - Attempted path: ${filePath}`);
            console.log(`  - Allowed directory: ${uploadsDir}`);
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        
        console.log(`✅ Path security check passed`);
        
        // Check if file exists
        console.log(`\n📁 Checking file existence...`);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found on disk: ${filePath}`);
            res.status(404).json({ error: 'File not found' });
            return;
        }
        
        console.log(`✅ File exists on disk`);
        
        // Check if it's a file (not a directory)
        const stats = fs.statSync(filePath);
        console.log(`📊 File stats:`);
        console.log(`  - Size: ${stats.size} bytes (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`  - Created: ${stats.birthtime}`);
        console.log(`  - Modified: ${stats.mtime}`);
        
        if (stats.isDirectory()) {
            console.log(`❌ Path is a directory, not a file`);
            res.status(400).json({ error: 'Cannot download directory' });
            return;
        }
        
        console.log(`✅ File validation passed`);
        
        // Stream the file
        console.log(`\n📤 Starting file download...`);
        console.log(`  - Sending file: ${safeFilename}`);
        console.log(`  - File size: ${stats.size} bytes`);
        
        const downloadStartTime = Date.now();
        
        res.download(filePath, safeFilename, (err) => {
            const downloadDuration = Date.now() - downloadStartTime;
            
            if (err) {
                console.error(`❌ Download error after ${downloadDuration}ms:`);
                console.error(`  - Error: ${err.message}`);
                console.error(`  - Stack: ${err.stack}`);
                
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Download failed' });
                }
            } else {
                const totalDuration = Date.now() - startTime;
                console.log(`✅ Download completed successfully!`);
                console.log(`  - Download duration: ${downloadDuration}ms`);
                console.log(`  - Total request duration: ${totalDuration}ms`);
                console.log(`  - File: ${safeFilename}`);
                console.log(`  - Size: ${stats.size} bytes`);
                console.log(`  - Speed: ${(stats.size / downloadDuration * 1000 / 1024 / 1024).toFixed(2)} MB/s`);
            }
            
            console.log("========== DOWNLOAD REQUEST END ==========\n");
        });
        
    } catch (error:any) {
        const errorDuration = Date.now() - startTime;
        console.error(`\n💥 UNEXPECTED ERROR after ${errorDuration}ms:`);
        console.error(`  - Error name: ${error.name}`);
        console.error(`  - Error message: ${error.message}`);
        console.error(`  - Error stack: ${error.stack}`);
        
        if (error instanceof mongoose.Error) {
            console.error(`  - MongoDB Error: ${error.message}`);
        }
        
        console.error("========== DOWNLOAD REQUEST FAILED ==========\n");
        res.status(500).json({ error: 'Internal server error' });
    }
}