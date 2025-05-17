import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.urlencoded({
    extended: true,
    limit:"16kb"
}))
app.use(express.json());
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import userRouter from "./routes/user.route.js";


//using/declaration routes
app.use("/api/v1/users", userRouter)

// example route http://localhost:8000/api/v1/users/register



export {app}