import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDb = async () => {
    try{
        await mongoose.connect(env.MONGO_URL);
        console.log('Connected to MongoDB');
    }
    catch(err){
        console.error('Error connecting to MongoDB', err);
    }
}