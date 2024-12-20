import 'dotenv/config';
import qs from "qs"
import axios from 'axios';
import { replyToComment } from './Openai.js';
export const generateTwitterOauthUri = () => {
    return `https://x.com/i/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(
        process.env.REDIRECT_URI)}&scope=${encodeURIComponent(process.env.SCOPE)}&state=state&code_challenge=challenge&code_challenge_method=plain`;
}
export const exchangeToken = async (code) => {
    try {
        const tokenResponse = await axios.post(
            'https://api.x.com/2/oauth2/token',
            qs.stringify({
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.REDIRECT_URI,
                client_id: process.env.CLIENT_ID,
                code_verifier: 'challenge',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
                },
            }
        );
        // Extract access and refresh tokens
        const { access_token, refresh_token } = tokenResponse.data;
        return { access_token, refresh_token }
    } catch (error) {
        console.log(error);
        new Error('Failed to exchange token')
    }
}
export const getUserDetails = async (accessToken) => {
    try {
        const { data } = await axios.get("https://api.x.com/2/users/me", { headers: { Authorization: `Bearer ${accessToken}`, } });
        return { success: true, data: data };
    } catch (error) {
        console.error("Error fetching user details:", error.response?.data || error.message);
        return { success: false, data: error };
    }
};
export const regenerateAccessToken = async (refreshToken) => {
    try {
        const { data } = await axios.post(
            "https://api.x.com/2/oauth2/token",
            qs.stringify({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: process.env.CLIENT_ID,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString("base64")}`,
                },
            }
        );
        return data;
    } catch (error) {
        console.error("Error regenerating access token:", error.response?.data || error.message);
        throw new Error("Failed to regenerate access token");
    }
};
export const createTweet = async ({ content, accessToken }) => {
    try {
        const { data: createdTweet } = await axios.post("https://api.x.com/2/tweets", {
            "text": content
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return createdTweet;
    } catch (error) {
        console.error("Error creating Tweet:", error.response?.data || error.message);
    }
}
export const get_mentions_since = async (accessToken, userId, last_mention_id) => {
    try {
        const { data } = await axios.get(`https://api.x.com/2/users/${userId}/mentions`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { 'max_results': 20, 'expansions': 'author_id', 'since_id': last_mention_id }
        })
        return { mentions: data.data, meta: data.meta, users: data.includes.users };
    } catch (error) {
        console.error(error.response.data);

    }
}
export const reply_to_comment = async (accessToken, reply, id) => {
    try {
        const response = await axios.post("https://api.x.com/2/tweets", {
            "text": reply,
            "reply": {
                "in_reply_to_tweet_id": id
            }
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
    } catch (error) {
        console.log(error.response.data);
    }
}
export const check_and_reply_to_mentions = async (userName, accessToken, userId, last_mention_id) => {
    try {
        const { mentions, meta, users } = await get_mentions_since(accessToken, userId, last_mention_id)
        const authorIdToUsername = users.reduce((acc, user) => {
            acc[user.id] = user.username;
            return acc;
        }, {});
        for (const mention of mentions) {
            const reply = await replyToComment(userName, mention.text, authorIdToUsername[mention.author_id])
            await reply_to_comment(accessToken, reply, mention.id)
        }
        return meta.newest_id
    } catch (error) {
        console.log("Error while checking and replying to mentions:", error.response.data);
    }
}
export const getUserIdByUsername = async (username, accessToken) => {
    try {
        const url = `https://api.twitter.com/2/users/by/username/${username}`;
        const headers = { Authorization: `Bearer ${accessToken}` };
        const response = await axios.get(url, { headers });
        return response.data?.data?.id || null;
    } catch (error) {
        console.error(`Error fetching user ID for ${username}:`, error.response?.data || error.message);
        return null;
    }
}
export const getUserTweets = async (userId, accessToken) => {
    try {
        const url = `https://api.twitter.com/2/users/${userId}/tweets`;
        const headers = { Authorization: `Bearer ${accessToken}` };
        const params = {
            max_results: 20,
            expansions: 'author_id',
        };
        const response = await axios.get(url, { headers, params });
        return {
            tweets: response.data?.data || [],
            usersInfo: response.data?.includes?.users || [],
        };
    } catch (error) {
        console.error(`Error fetching tweets for user ID ${userId}:`, error.response?.data || error.message);
        return { tweets: [], usersInfo: [] };
    }
}
export const replyToTweet = async (tweetText, inReplyToTweetId, accessToken) => {
    try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const payload = {
            text: tweetText,
            reply: { in_reply_to_tweet_id: inReplyToTweetId },
        };
        const response = await axios.post(`https://api.twitter.com/2/tweets`, payload, { headers });
        console.log(`Reply posted successfully to tweet ${inReplyToTweetId}`);
        return response.data;
    } catch (error) {
        console.error(`Error posting reply to tweet ${inReplyToTweetId}:`, error.response?.data || error.message);
        return null;
    }
}
