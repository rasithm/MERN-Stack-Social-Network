// const express = require('express');
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import authRoute from "./routes/authRoute.js";
import userRoute from './routes/userRoute.js';
import postRoute from './routes/postRoute.js';
import notificationRoute from './routes/notificationRoute.js'
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
// import cloudinary from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors'


const __dirname = path.resolve()

dotenv.config();

const app = express();


const PORT = process.env.PORT || 3500;

app.use(express.json(
    {
        limit : '5mb'
    }
))
app.use(cookieParser())

app.use(cors({
    origin : 'http://localhost:3000',
    credentials : true
}))
app.use(express.urlencoded({
    extended : true
}))

cloudinary.config({
    cloud_name :process.env.CLOUDINARY_CLOUD_NAME ,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET_KEY
})


app.use('/api/auth' , authRoute);
app.use('/api/users' , userRoute);
app.use('/api/posts' , postRoute);
app.use('/api/notification' , notificationRoute)


if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,'/frontend/build')))
    app.use('*' , (req,res) => {
        res.sendFile(path.resolve(__dirname,'frontend', 'build' ,'index.html'))
    })
}

app.listen(PORT , () => {
    console.log(`server running on port ${PORT}`)
    connectDB();
});