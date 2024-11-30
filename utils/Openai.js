import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OpenAI_API_KEY });
export const generatePost = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [{
                role: "system",
                content: prompt
            }],
        });
        let botPost = response.choices[0].message.content
        return botPost
    } catch (error) {
        console.log(error);
        throw new Error("error generating content")
    }
}
export const replyToComment = async (name, comment, sender) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [{
                role: "system",
                content: `you are ${name} and sender's name is ${sender}, Give a funky and friendly reply to the ${sender}'s comment
                note: while using senders name put '@' as prefix to his name as tagging him`
            },
            {
                role: "user",
                content: comment
            }]
        });
        let botPost = response.choices[0].message.content
        return botPost
    } catch (error) {
        console.log(error);
        throw new Error("error generating content")
    }
}
