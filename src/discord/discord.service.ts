// discord.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Client, Message, GatewayIntentBits } from 'discord.js';
import { GeminiService } from 'src/gemini/gemini.service';

@Injectable()
export class DiscordService {
  private readonly client: Client;
  private readonly logger = new Logger(DiscordService.name);
  private readonly token: string;

  constructor(private readonly geminiService: GeminiService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.token = process.env.DISCORD_BOT_TOKEN;
    this.logger.log(`DiscordService initialized with token: ${this.token}`);
  }

  async onModuleInit() {
    this.logger.log(`onModuleInit called`);

    this.client.on('ready', () => {
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
    });

    this.client.on('messageCreate', async (message) => {
      console.log(message);
      this.logger.log(`Message received: ${message.content}`);
      if (message.author.bot) return;

      if (message.content.startsWith('!prompt')) {
        const prompt = message.content.slice(8).trim();
        this.logger.log(`Prompt received: ${prompt}`);
        const response = await this.geminiService.sendToGemini(prompt);
        this.logger.log(`Response: ${response}`);
        message.channel.send(response);
      }
    });

    this.logger.log(`Logging in with token: ${this.token}`);
    await this.client.login(this.token);
  }

  async handlePrompt(prompt: string): Promise<string> {
    // Logic to send prompt to Gemini API and return the response
    return `You sent: ${prompt}`;
  }
}
