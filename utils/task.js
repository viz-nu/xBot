import { User } from "../models/User.js";
import { check_and_reply_to_mentions, createTweet, getUserDetails, regenerateAccessToken } from "./Oauth2.js";
import { generatePost } from "./Openai.js";

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


