import express from 'express';
import { exchangeToken, generateTwitterOauthUri, getUserDetails } from "./utils/Oauth2.js";
import { startCronJob } from './utils/cron.js';
import { User } from './models/User.js';
import { connectDB } from './utils/dbConnect.js';
const app = express()
startCronJob()
await connectDB()
app.get("/", (req, res) => res.redirect(generateTwitterOauthUri()));
app.get('/callback', async (req, res) => {
  try {
    const { state, code } = req.query;
    if (!code) return res.status(400).send({ success: false, message: 'Authorization code is missing.' });
    const { access_token, refresh_token } = await exchangeToken(code)
    const { data } = await getUserDetails(access_token)
    const user = await User.findOneAndUpdate(
      { userId: data.data.id }, // The condition to search for the user
      {
        name: data.data.name,
        username: data.data.username,
        accessToken: access_token,
        refreshToken: refresh_token,
        sinceId: "",
        prompt: ""
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if one doesn't exist
        setDefaultsOnInsert: true, // Set default values for fields on insert
      }
    );
    res.status(200).send({ success: true, message: "User saved", data: user })
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message);
    res.status(500).send({ message: 'Failed to retrieve tokens.', data: error });
  }
});
app.listen(process.env.PORT, () => console.log(`server is running on  http://localhost:${process.env.PORT}/`))