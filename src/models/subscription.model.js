import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        //the one who is "SUBSCRIBING"
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    channel:{
        // the one who is "SUBSCRIBED"
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
    {
        Timestamp: true
})

export const subscription = mongoose.model("subscription", subscriptionSchema) 