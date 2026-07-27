import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { BadRequestError } from "../utils/errors";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function getResumeMatchScore(resumeText: string, job: { title: string; description: string; requirements: string[]; skills: string[] }) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an ATS resume screener. Compare this resume to the job and respond with ONLY valid JSON, no markdown/backticks: {"score": <0-100 integer>, "feedback": "<2-3 sentence feedback>"}.

Job Title: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements.join(", ")}
Skills: ${job.skills.join(", ")}

Resume:
${resumeText}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, "");
    try {
        const parsed = JSON.parse(text);
        return { score: Math.max(0, Math.min(100, Number(parsed.score))), feedback: String(parsed.feedback) };
    } catch {
        throw new BadRequestError("Could not analyze resume — try again");
    }
}