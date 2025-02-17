import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) {}

    /**
     * Generates a response by sending the provided prompt to the Gemini service.
     *
     * @param prompt - The prompt to send to the Gemini service.
     * @returns The response from the Gemini service.
     */
    @Post()
    async generateResponse(@Body('prompt') prompt: string) {
        return this.geminiService.sendToGemini(prompt);
    }
}