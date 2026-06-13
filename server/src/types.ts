import mongoose from "mongoose"


export interface User{
    id:string
    username:string
    userId:string
    isAdmin:boolean
    email:string
    password:string
    refreshToken?:string
    attachment?:any
}

export interface Group{
    name:string
    admin:any
    description:string
    members:any[]
 avatarURL?:any
 messages:any
 attachment?:any

 lastMessage?:any


}

export interface Message {
    id: string;
    content: string;
    seen:boolean
    createdAt: string;  
    sender:any 
    type:"text"|"file"|"voice"
    file:any
 
}

export interface Attachment{
    filename:string
    originalName:string
    mimeType:string
    size:number
    url:string
    duration?:number
}

export interface Chat {
    id: string;
    lastMessage?:any
    members:any
    updatedAt: string; 
    avatarURL?:any
    description:string
    messages:any
    attachment?:any


  
}

