import OpenAI from "openai";
import { env } from "../config/env";
import { BadRequestError } from "../utils/errors";

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY,
});

export async function getResumeMatchScore(
    resumeText: string,
    job: {
        title: string;
        description: string;
        requirements: string[];
        skills: string[];
    }
) {
    const prompt = `
You are an ATS Resume Screener.

Compare the resume with the job.

Return ONLY valid JSON.

{
  "score": 0-100,
  "feedback": "2-3 sentences"
}

Job Title:
${job.title}

Description:
${job.description}

Requirements:
${job.requirements.join(", ")}

Skills:
${job.skills.join(", ")}

Resume:
${resumeText}
`;

    const response = await client.chat.completions.create({
        model: "nvidia/nemotron-3-nano-30b-a3b:free",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    const text = response.choices[0].message.content ?? "";

    try {
        const parsed = JSON.parse(text);

        return {
            score: Number(parsed.score),
            feedback: parsed.feedback,
        };
    } catch {
        throw new BadRequestError("AI returned invalid JSON");
    }
}