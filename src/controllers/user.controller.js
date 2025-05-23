import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import{ ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)

        const accessToken  = user.generateAccessToken()
        const refreshToken  = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false })
        
        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "something went Wrong while generating refresh and Access token")
    }
}

// for cookies 
const options = {
    httpOnly: true,
    secure: true
}

const registerUser = asyncHandler( async(req, res) => {
    //take input from user detail from Postman
    //validate input detail
    //check if user is already exist
    //check for images, check for avatar
    //upload them to cloudinary, check avatar
    //create User object - create entry in db
    //remove password and refreshtoken field from response
    //check for user creation
    //return response

    //take input from user detail from Postman
    const { email, username, fullName, password}= req.body
   // console.log("email :",email)
    

    //validate input detail
    
  if ([fullName, email, username, password].some((field)=>!field || field?.trim()==="")) {
    throw new ApiError(400, "All fields are required")
  }

   //check if user is already exist
   const existedUser = await User.findOne({
    $or:[ { username },{ email } ]
   })

   if (existedUser) {
    throw new ApiError(409,"User Already Existed")
   }

//check for images, check for avatar
    const avatarLocalPath=req.files?.avatar[0]?.path;
    //const CoverImageLocalPath=req.files?.coverImage[0]?.path;
    let CoverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
        CoverImageLocalPath = req.files.coverImage[0].path
    }
    //console.log(req.files)
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Required")
    }

 //upload them to cloudinary, check avatar
    const avatar= await uploadOnCloudinary(avatarLocalPath);
    const coverImage= await uploadOnCloudinary(CoverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar Required")
    }

//create User object - create entry in db
 
    const user = await User.create({
        fullName,
        avatar :avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password,
    })
//remove password and refreshtoken field from response
    const createdUser = await User.findById(user._id)
    .select(
        "-password -refreshToken"
    )

    //check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    //return response

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User is Created Successfully")
    )




} )

const loginUser = asyncHandler(async(req, res)=>{
    //take input from user
    //username || email
    //find user
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password } = req.body
    //console.log ("email : ", email )

    if (!(username || email)) {
        throw new ApiError(404,"username or email is required")
    }

    const user = await User.findOne({
        $or:[ { username },{ email } ]
    })

    if (!user) {
        throw new ApiError(404," User does not exist ")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
     if (!isPasswordValid) {
        throw new ApiError(401," Password Incorrect ")
    }
    const {refreshToken, accessToken} =await generateAccessAndRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    
    //console.log("user Logged In successfully")
     
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    )

       

})

const logoutUser = asyncHandler( async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    
        //console.log("userlogged Out successfully")

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {},"User Logged Out"))

})

const refreshAccessToken = asyncHandler(async(req, res)=>{

    incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "UnAuthorized Token")  
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
             process.env.REFRESH_TOKEN_SECRET
            )
    
            const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token") 
        }
    
        if (!incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is either expired or used") 
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "error in refreshing the access token")   
    }

})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}