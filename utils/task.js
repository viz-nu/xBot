import { prisma } from "./dbConnect.js";
import { createTweet, getUserDetails, regenerateAccessToken } from "./Oauth2.js";
import { generatePost } from "./Openai.js";

export const runTask = async () => {
    try {
        const users = await prisma.user.findMany();
        for (let user of users) {
            let result = await getUserDetails(user.accessToken);
            if (!result.success) {
                const { access_token, refresh_token } = await regenerateAccessToken(user.refreshToken)
                await prisma.user.update({
                    where: { userId: user.userId },
                    update: {
                        accessToken: access_token,
                        refreshToken: refresh_token,
                    }
                });
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