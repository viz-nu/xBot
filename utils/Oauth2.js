import 'dotenv/config';
import qs from "qs"
import axios from 'axios';
export const generateTwitterOauthUri = () => {
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(
        process.env.REDIRECT_URI)}&scope=${encodeURIComponent(process.env.SCOPE)}&state=state&code_challenge=challenge&code_challenge_method=plain`;
}
export const exchangeToken = async (code) => {
    try {
        const tokenResponse = await axios.post(
            'https://api.twitter.com/2/oauth2/token',
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
        const { data } = await axios.get("https://api.twitter.com/2/users/me", { headers: { Authorization: `Bearer ${accessToken}`, } });
        return { success: true, data: data };
    } catch (error) {
        console.error("Error fetching user details:", error.response?.data || error.message);
        return { success: false, data: error };
    }
};
export const regenerateAccessToken = async (refreshToken) => {
    try {
        const { data } = await axios.post(
            "https://api.twitter.com/2/oauth2/token",
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
