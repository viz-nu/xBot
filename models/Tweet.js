import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    tweet_id: String,
    user_id: String,
});

export const FanTweet = mongoose.model('FanTweet', tweetSchema);