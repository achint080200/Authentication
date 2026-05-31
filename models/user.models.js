import mongoose from 'mongoose';

let userSchema = new mongoose.Schema({
    userName : {
        type: String,
        required: [true, "User name is required"],
        unique: true
    },
    emailId : {
        type: String,
        required: [true, "Email ID is required"],
        unique: true
    },
    password : {
        type: String,
        required: [true, "Password is required"]
    }
})

export const User = mongoose.model('User', userSchema);