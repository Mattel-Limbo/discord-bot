import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;

    /**
     * Initializes the GoogleGenerativeAI instance with the GEMINI_API_KEY environment variable.
     */
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    /**
     * Sends a prompt to the Gemini generative AI model and returns the generated text response.
     *
     * @param prompt - The input prompt to send to the Gemini model.
     * @returns The generated text response from the Gemini model.
     */
    async sendToGemini(prompt: string): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return text;
    }
}