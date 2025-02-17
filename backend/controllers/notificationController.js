import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";



export const getNotification = async(req,res) => {
    try{

        const userId = req.user._id;
        let user = await User.findOne({_id : userId})
        if(!user){
            return res.status(404).json({error : "user not found"})
        }
        let notification = await Notification.find({to : {$in : userId}}).sort({createAt : -1}).populate({
            path : "from",
            select : ["username" , "profileImg"]
        }).populate({
            path : "to",
            select : ["username" , "profileImg"]
        })
        if(notification.lenght === 0){
            return res.status(200).json([])
        }
        await Notification.updateMany({to : userId} , {read : true})
        res.status(200).json(notification)
    }catch(error){
        console.log(`error in getNotification controller : ${error}`)
        res.status(500).json({error : "internal server error"})
    }
}
export const deleteNotification = async(req,res) => {
    try{
        const userId = req.user._id;
        let user = await User.findOne({_id : userId})
        if(!user){
            return res.status(404).json({error : "user not found"})
        }

        let notificationDelete = await Notification.deleteMany({to : userId})
        res.status(200).json({message : "notification successfully deleted"})  

    }catch(error){
        console.log(`error in deleteNotification controller : ${error}`)
        res.status(500).json({error : "internal server error"}) 
    }
}