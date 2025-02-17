import jwt from "jsonwebtoken";
import User from '../models/userModel.js';

const protectRoute = async(req ,res , next) => {
    try{
        const token = req.cookies.JWT;
        if(!token){
            return res.status(400).json({error : "unauthorized : No token provided"})
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET)

        if(!decoded){
            return res.status(400).json({error : "unauthorized :  invalid token"})
        }

        const user = await User.findOne({_id : decoded.userId}).select("-password");
        if(!user){
            return res.status(400).json({error : "User not found"})
        }

        req.user = user;
        next();


    }catch(error){
        console.log(`error in protectRoter middleWire : ${error}`)
        res.status(500).json({error : "internal server error"})
    }
}
export default protectRoute;