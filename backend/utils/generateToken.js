import jwt from "jsonwebtoken";

const generateToken = (userId , res) => {
    const token = jwt.sign({userId } , process.env.JWT_SECRET ,{
        expiresIn : "15d"
    })

    res.cookie("JWT" , token , {
        maxAge : 15*24*60*1000,
        httpOnly : true ,
        sameSite : "strict",
        secure : process.env.Node_ENV !== "development"
    })
}

export default generateToken;