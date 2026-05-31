import mongoose from "mongoose";

let sessionSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true, "User ID is required"]
    },
    refreshTokenHash : {
        type : String,
        required : [true, "Refresh token hash is required"]
    },
    ip : {
        type : String,
        required : [true, "IP address is required"]
    },
    userAgent : {
        type : String,
        required : [true, "User agent is required"]
    },
    revoked : {
        type : Boolean,
        default : false
    }}, { timestamps : true });
    
export const Session = mongoose.model("Session", sessionSchema);