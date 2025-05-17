import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import{ ApiResponse } from "../utils/ApiResponse.js"

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
    console.log("email :",email)
    

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
    const CoverImageLocalPath=req.files?.coverImage[0]?.path;
    
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

export {
    registerUser
}