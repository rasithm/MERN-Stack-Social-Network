import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import bcrypt from 'bcryptjs'
import { v2 as cloudinary } from 'cloudinary';

export const getProfile = async(req,res) => {
    try{

        const {username} = req.params;

        const user = await User.findOne({username})

        if(!user){
            return res.status(404).json({error : 'User not found'});
        }

        res.status(200).json(user)

    }catch(error){
        console.log(`error in getProfile controller : ${error}`);
        res.status(500).json({error : 'internal server error'})
    }
}

export const followUnfollow = async(req,res) => {
    try{
        const {id} = req.params

        const userToModify = await User.findById({_id : id});
        const currentUser = await User.findById({_id : req.user._id});

        if(id === req.user._id){
            return res.status(400).json({error : "you can't follow or unfollow yourself"})
        }

        if(!userToModify || !currentUser){
            return res.status(404).json({error : 'User not found!'})
        }

        const isFollowing = currentUser.following.includes(id)

        if(isFollowing){
            //unfollowing
            await User.findByIdAndUpdate({_id : id} , {$pull : {followers : req.user._id}})
            await User.findByIdAndUpdate({_id : req.user._id} , {$pull : {following : id}})
            return res.status(200).json({message : "unfollow successfully"})
        }else{
            //following

            await User.findByIdAndUpdate({_id : id} , {$push : {followers : req.user._id}})
            await User.findByIdAndUpdate({_id : req.user._id} , {$push : {following : id}})
            //send notification
            const newNotification = new Notification({
                type : "follow",
                from : req.user._id ,
                to : userToModify.id,
                
            })
            await newNotification.save();
            return res.status(200).json({message : "follow successfully"})
        }
        
    }catch(error){
        console.log(`error in follow and Unfollow controller : ${error}`)
        res.status(500).json({error : 'internal server error'})
    }
}

export const getSuggestedUsers = async(req,res) => {
    try{

       const userId = req.user._id;
       const followedByMe = await User.findById({_id : userId}).select('-password');
       const users = await User.aggregate([
        {$match : {_id : {$ne : userId}}} , {$sample : { size : 10}}
       ]);
       const filteredUser = users.filter((user) => !followedByMe.following.includes(user._id));
       const suggestedUser = filteredUser.slice(0,4);
       suggestedUser.forEach((user) => (user.password = null));
       res.status(200).json(suggestedUser)



    }catch(error){
        console.log(`error in getSuggestedUser controllers : ${error}`)
        res.status(500).json({error : "internal server error"})
    }
}

export const updateUser = async(req,res) => {
    try{

        const userId = req.user._id;
        let {username , fullname,Email , currentpassword , newpassword , Link , Bio , ProfileImg , CoverImg} = req.body;
        
        let user = await User.findById({_id : userId});
        if(!user){
           return res.status(404).json({error : "user not found"})
        }
        if((!currentpassword && newpassword) || (!newpassword && currentpassword)){
           return res.status(400).json({error : "please provide both new password and current password"})
        }
        if(currentpassword && newpassword){
            const isMatch = await bcrypt.compare(currentpassword , user.password)
            if(!isMatch){
               return res.status(400).json({error : "Current password is incorrect"})
            }
            if(newpassword.length < 6){
                return res.status(400).json({error : "new password must be 6 chara"})
            }
            if(currentpassword == newpassword){
                return res.status(400).json({error : "Current password and newpassword both are same"})  
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newpassword , salt)
        }
        
        

        if(ProfileImg){
            if (user.profileImg) {
                const publicId = user.profileImg.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadResponse = await cloudinary.uploader.upload(ProfileImg)
            ProfileImg =  uploadResponse.secure_url;
        }

        if(CoverImg){
            if (user.coverImg) {
                const publicId = user.coverImg.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadResponse = await cloudinary.uploader.upload(CoverImg);
            CoverImg = uploadResponse.secure_url;
        }

        let userNameExisting = await User.findOne({username : username})
        let emailExisting = await User.findOne({email : Email})
        if(userNameExisting || emailExisting){
           return res.status(400).json({error : "username or email already existing"})
        }
        user.fullname  = fullname || user.fullname;
        user.username = username || user.username;
        user.email = Email || user.email;
        user.link = Link || user.link;
        
        user.bio = Bio || user.bio;
        user.coverImg = CoverImg || user.coverImg;
        user.profileImg = ProfileImg || user.profileImg;

        user = await user.save();
        // password null is only for testing purpose
        user.password = null;
        return res.status(200).json(user);



    }catch(error){
        console.log(`error in updateUser controllers : ${error}`)
        res.status(500).json({error : "internal server error"})
    }
}