import User from "../models/userModel.js";
import cloudinary from 'cloudinary'
import Post from "../models/postModel.js";
import Notification from "../models/notificationModel.js";

export const createPost = async(req,res) => {
    try{

        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();
        const users = await User.findById({_id : userId});
        if(!users){
           return res.status(404).json({error : "User not found"})
        }

        if(!img && !text){
           return res.status(404).json({error : "please upload  img or text"})
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost = new Post({
            user : userId,
            img : img,
            text : text

        })

        await newPost.save();
        res.status(201).json(newPost);


    }catch(error){
        console.log(`error in createPost controller : ${error}`)
        res.status(500).json({error : "internal server error"})
    }
}


export const deletePost = async(req,res) => {
    try{

        const {id} = req.params
        let post = await Post.findById({_id : id})
        const userId = req.user._id;
        let user = await User.findById({_id : userId})
        if(!user){
            return res.status(404).json({error : "user not found"})
        }
        if(!post){
           return res.status(404).json({error : "post not found"})
        }
        if(user._id.toString() !== post.user.toString()){
           return res.status(401).json({error : "the authorized not delete post"})
        }
        if(post.img){
            let postImg =  post.img.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(postImg)
        }
        await Post.findByIdAndDelete({_id : id})

        res.status(200).json({message : 'post delete successfully'})



    }catch(error){
        console.log(`error in deletePost controller : ${error}`)
        res.status(500).json({error : "internal server error"}) 
    }
}


export const createComment = async(req,res) => {
    try{

        const {text} = req.body;
        const {id} = req.params;
        const post = await Post.findById({_id : id})
        if(!post){
            return res.status(404).json({error : "post not found"})

        }
        const userId = req.user._id;
        const user = await User.findById({_id : userId})
        if(!user){
            return res.status(404).json({error : "user not found"})
        }
        if(!text){
            return res.status(400).json({error : "user must enter text value"})
        }
        let toUser = post.user
        let comment = {
            text : text,
            user : userId
        }
        await post.comments.push(comment)
        await post.save();
        const updatedPost = await Post.findById(id).populate("comments.user", "fullname username profileImg");
        const updatedComment = updatedPost.comments;


        
        const newNotification = new Notification({
            type : "comment",
            from : userId,
            to : toUser,

        })
        await newNotification.save();
        // res.status(200).json(post)
        res.status(200).json(updatedComment)
    }catch(error){
        console.log(`error in createCommand controller : ${error}`)
        res.status(500).json({error : "internal server error"})  
    }
}
export const likeUnlike = async(req,res) => {
    try{

        const userId = req.user._id;
        let {id : postId} = req.params;

        const post = await Post.findById({_id : postId})
        if(!post){
            res.status(404).json({error : "post not found"})
        }
        const userLikePost = await post.like.includes(userId)
        if(userLikePost){
            //unlike
            await Post.findByIdAndUpdate({_id : postId} , {$pull : {like : userId}})
            await User.findByIdAndUpdate({_id : userId} , {$pull : {likedPosts : postId}})

            const updatedLikes = post.like.filter((id) => id.toString() !== userId.toString())

            res.status(200).json(updatedLikes) 
        }else{
            //like
            // await Post.findByIdAndUpdate({_id : postId} , {$push : {like : userId}})
            post.like.push(userId)
            await User.findByIdAndUpdate({_id : userId} , {$push : {likedPosts : postId}})
            await post.save();


            const updatedLikes = post.like
            // const updatedLikes = post.like.filter((id) => id.toString() === userId.toString())
            res.status(200).json(updatedLikes)
            const newNotification = new Notification({
                type : "like",
                from : userId,
                to : post.user
            })
            await newNotification.save();
            // res.status(200).json(newNotification)
        }
    }catch(error){
        console.log(`error in likeUnlike controller : ${error}`)
        res.status(500).json({error : "internal server error"})   
    }
}

export const allPost = async(req,res) => {
    try{

        const posts = await Post.find().sort({createdAt : -1}).populate({
            path : "user",
            select : ["-password","-followers" , "-following" , "-email" , "-bio" , "-link" , "-fullname"]
           
        })
        .populate({
            path : "comments.user",
            select : ["-password", "-email" ]
            
        })
        
        if(posts.lenght === 0){
            return res.status(200).json([])
        }
        res.status(200).json(posts)

    }catch(error){
        console.log(`error in getAllPost controller : ${error}`)
        res.status(500).json({error : "internal server error"})  
    }
}

export const likedPosters = async(req ,res) => {
    try{
        const userId = req.params.id;
        let user = await User.findOne({_id : userId});
        if(!user){
            return res.status(404).json({error : "user not found"})
        }

        let likedPost = await Post.find({_id : {$in : user.likedPosts}}).populate({
            path : "user",
            select : ["-password","-followers" , "-following" , "-email" , "-bio" , "-link" , "-fullname"]
        })
        .populate({
            path : 'comments.user',
            select : ["-password","-followers" , "-following" , "-email" , "-bio" , "-link" , "-fullname"]
        })

        res.status(200).json(likedPost)


    }catch(error){
        console.log(`error in linkedposters controller : ${error}`)
        res.status(500).json({error : "internal server error"})  
    }
}

export const getFollowingposters = async(req,res) => {
    try{
        const userId = req.user._id;
        const user = await User.findOne({_id : userId})
        if(!user){
            res.status(404).json({error : "user not found"})
        }
        const followingPost =  user.following;
        const feedPost = await Post.find({user : {$in : followingPost}}).sort({createAt : -1}).populate({
            path : "user",
            select : ["-password","-followers" , "-following" , "-email" , "-bio" , "-link" , "-fullname"]
        })
        .populate({
            path : 'comments.user',
            select : ["-password","-followers" , "-following" , "-email" , "-bio" , "-link" , "-fullname"]
        })
        
        if(feedPost.lenght === 0){
            res.status(200).json([])
        }
        res.status(200).json(feedPost)

    }catch(error){
        console.log(`error in followingPoster controller : ${error}`)
        res.status(500).json({error : "internal server error"})  
    }
}



export const getUserPost = async(req,res) => {
    try{
        const {username} = req.params;
        let user = await User.findOne({username : username})
        if(!user){
            return res.status(404).json({error : "user not found"})
        }
        let findPost = await Post.find({user : {$in : user._id}}).sort({createAt : -1}).populate({
            path : 'user',
            select : ["-password","-followers" , "-following" , "-email" , "-bio" , "-link" , "-fullname"]
        }).populate({
            path : 'comments.user',
            select : ["-password","-followers" , "-following" , "-email" , "-bio" , "-link" , "-fullname"]
        })
        if(findPost.lenght === 0){
            return res.status(200).json([])
        }
        res.status(200).json(findPost)
    }catch(error){
        console.log(`error in getUserPost controller : ${error}`)
        res.status(500).json({error : "internal server error"})
    }
}