import { Request, Response } from "express";
import { UserModel } from "../model/user";
import { AttachmentModel } from "../model/attachment";
import fs from "fs";
import path from "path";
interface MyQuery {
  userId: string;
}

export async function findUsersWithUserId(
  req: Request<any, any, any, MyQuery>,
  res: Response
) {
  try {
    const {userId}=req.query
    console.log((req as any).user)

    // Query mongo for partial matches
    const users = await UserModel.findOne({userId});
    if (!users ) {
       res.status(404).json({ message: "User does not exist" });
    }

     res.json({ message: "Users found", users });
  } catch (error) {
    console.error("Find users error:", error);
     res.status(500).json({ message: "Server error" });
  }
}




