import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OpenAI_API_KEY });
export const generatePost = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [{
                role: "system",
                content: `${prompt}`
            }],
        });
        let botPost = response.choices[0].message.content
        return botPost
    } catch (error) {
        console.log(error);
        throw new Error("error generating content")
    }
}
