import { User } from "../models/User.js";
import { check_and_reply_to_mentions, createTweet, getUserDetails, getUserIdByUsername, getUserTweets, regenerateAccessToken, replyToTweet } from "./Oauth2.js";
import { generatePost } from "./Openai.js";
import { FanTweet } from "../models/Tweet.js"
export const runTask = async () => {
    try {
        const users = await User.find({});
        for (let user of users) {
            let result = await getUserDetails(user.accessToken);
            if (!result.success) {
                const { access_token, refresh_token } = await regenerateAccessToken(user.refreshToken)
                await User.findOneAndUpdate({ userId: user.userId }, { accessToken: access_token, refreshToken: refresh_token });
                user.accessToken = access_token
            }
            const content = await generatePost(user.prompt)
            const createdTweet = await createTweet({ content, accessToken: user.accessToken })
            console.log("Tweet Created", createdTweet);
        }
    } catch (error) {
        console.log(error);
    }
}
export const runReply = async () => {
    try {
        const users = await User.find({});
        for (let user of users) {
            let result = await getUserDetails(user.accessToken);
            if (!result.success) {
                const { access_token, refresh_token } = await regenerateAccessToken(user.refreshToken)
                await User.findOneAndUpdate({ userId: user.userId }, { accessToken: access_token, refreshToken: refresh_token });
                user.accessToken = access_token
            }
            let newSince_id = await check_and_reply_to_mentions(user.username, user.accessToken, user.userId, user.sinceId || null)
            await User.findOneAndUpdate({ userId: user.userId }, { sinceId: newSince_id });

            console.log("checked replied");
        }
    } catch (error) {
        console.log(error);

    }
}

export const runFandom = async () => {
    try {
        console.log('Checking for new tweets...');
        const users = await User.find({});
        for (const user of users) {
            let result = await getUserDetails(user.accessToken);
            if (!result.success) {
                const { access_token, refresh_token } = await regenerateAccessToken(user.refreshToken)
                await User.findOneAndUpdate({ userId: user.userId }, { accessToken: access_token, refreshToken: refresh_token });
                user.accessToken = access_token
            }
            //user.following
            for (const username of user.following) {
                console.log(`Processing tweets for ${username}...`);
                const userId = await getUserIdByUsername(username, user.accessToken);
                if (!userId) {
                    console.log(`User ${username} not found. Skipping...`);
                    continue;
                }
                const { tweets, usersInfo } = await getUserTweets(userId, user.accessToken);
                const authorIdToUsername = Object.fromEntries(usersInfo.map(user => [user.id, user.username]));
                for (const tweet of tweets) {
                    const tweetId = tweet.id;
                    if (!tweet.text.startsWith('RT @')) {
                        const exists = await FanTweet.findOne({ tweet_id: tweetId, user_id: userId });
                        if (!exists) {
                            const authorUsername = authorIdToUsername[tweet.author_id] || '';
                            const replyText = `Thanks for your tweet, @${authorUsername}! ${tweet.text}`;
                            const replyData = await replyToTweet(replyText, tweetId, user.accessToken);
                            if (replyData) await FanTweet.create({ tweet_id: tweetId, user_id: userId });
                        }
                    }
                    setTimeout(() => {

                    }, 3000 * 60);
                }


            }
        }

    } catch (error) {
        console.log(error);
    }
}