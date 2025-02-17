import mongoose from 'mongoose';


const connectDB = async  ()=> {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongoDB connected");

    }catch(error){
        console.log(`error in connct DB: ${error}`)
        process.exit(1);
    }
}

export default connectDB;