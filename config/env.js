import dotenv from 'dotenv';
dotenv.config();
export const env =  {
    MONGO_URL: process.env.MONGO_URL,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET
};