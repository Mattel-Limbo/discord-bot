import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    async sendToGemini(prompt: string): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return text;
    }
}