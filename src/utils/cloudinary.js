import {v2 as cloudinary} from "cloudinary"





cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary= async(localFilePath) => {
     try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("file is uploaded on cloudinary", response);
        return response;

     } catch (error) {
        //remove the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        console.log("couldn't upload file on cloudinary",error)
        return null;
     }   
    }


