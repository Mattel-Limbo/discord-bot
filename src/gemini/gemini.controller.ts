import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) {}

    @Post()
    async generateResponse(@Body('prompt') prompt: string) {
        return this.geminiService.sendToGemini(prompt);
    }
}