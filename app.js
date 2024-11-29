import express from 'express';
import { exchangeToken, generateTwitterOauthUri, getUserDetails } from "./utils/Oauth2.js";
import { prisma } from './utils/dbConnect.js';
import { startCronJob } from './utils/cron.js';
const app = express()
startCronJob()
app.get("/", (req, res) => res.redirect(generateTwitterOauthUri()));
app.get('/callback', async (req, res) => {
  try {
    const { state, code } = req.query;
    if (!code) return res.status(400).send({ success: false, message: 'Authorization code is missing.' });
    const { access_token, refresh_token } = await exchangeToken(code)
    const { data } = await getUserDetails(access_token)
    const user = await prisma.user.upsert({
      where: { userId: data.data.id },
      update: {
        name: data.data.name,
        username: data.data.username,
        accessToken: access_token,
        refreshToken: refresh_token
      },
      create: {
        userId: data.data.id,
        name: data.data.name,
        username: data.data.username,
        accessToken: access_token,
        refreshToken: refresh_token,
        prompt: ""
      },
    });
    res.status(200).send({ success: true, message: "User saved", data: user })
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message);
    res.status(500).send({ message: 'Failed to retrieve tokens.', data: error });
  }
});
app.listen(process.env.PORT, () => console.log(`server is running on  http://localhost:${process.env.PORT}/`))