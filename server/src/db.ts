import { connect } from "mongoose";
export default function connectToDb(mongoUrl:string) {

    const db= connect(mongoUrl)
    return db
   
}