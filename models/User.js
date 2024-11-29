import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    userId: { type: String },
    name: { type: String },
    username: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    prompt: { type: String, },
    sinceId: { type: String, }
}, {
    timestamps: true
});

// Create a model from the schema
export const User = mongoose.model('User', userSchema);
