import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema= new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar:{
            type:String, // cloudinary url
            required:true
        },
        coverImage:{
            type:String //cloudinary url
        },
        watchHistory:[
                {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type:String,
            required:[true, "Password is Required"]
        },
        refreshToken:{
            type: String
        }

    },
    {
        timestamps: true
    }
)

// used to store password in encrypted form
userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next()
    
        this.password= await bcrypt.hash(this.password,10)
        next()

})

//custom method to validate password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//generate Access Token with methods object
userSchema.methods.generateAccessToken=function () {
    return jwt.sign(
        {
            _id :this.id,
            email :this.email,
            username :this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
//generate Refresh Token with methods object
userSchema.methods.generateRefreshToken=function () {
    return jwt.sign(
        {
            _id :this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)