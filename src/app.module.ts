import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordService } from './discord/discord.service';
import { GeminiService } from './gemini/gemini.service';
import { GeminiController } from './gemini/gemini.controller';

@Module({
  imports: [],
  controllers: [AppController, GeminiController],
  providers: [AppService, DiscordService, GeminiService],
})
export class AppModule {}
