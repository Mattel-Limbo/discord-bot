// discord.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Client, Message, GatewayIntentBits, DiscordAPIError } from 'discord.js';
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
    this.handleLoggedInDiscordClient();
    this.handleCreateDiscordMessage();

    await this.client.login(this.token);
  }

  /**
   * Handles the event when the Discord client is logged in and ready.
   * This logs a message to the logger indicating that the client is logged in.
   */
  handleLoggedInDiscordClient(): void {
    this.client.on('ready', () => {
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
    });

    this.logger.log(`Logging in with token: ${this.token}`);
  }
  
  /**
   * Handles the creation of a Discord message and processes any prompts contained within.
   *
   * When a message is received, this function checks if the message is from a bot and returns if so. If the message starts with '!prompt', it extracts the prompt from the message content, logs it, and sends a response back to the message channel.
   *
   * @param message - The Discord message that was created.
   */
  handleCreateDiscordMessage(): void {
    this.client.on('messageCreate', async (message: Message) => {
        if (message.author.bot) return;

        if (message.content.startsWith('!prompt')) {
          this.handlePrompt(message, '!prompt');
        } else {
          this.logger.error('Invalid command: ' + message.content);
        }
    }); 
  }

  /**
   * Handles a prompt received from a Discord message and returns a response.
   *
   * @param messageContent - The full content of the Discord message that contained the prompt.
   * @param prompt - The prompt extracted from the Discord message.
   * @returns A string response to the prompt.
   */
  async handlePrompt(discordMessage: Message, command: string): Promise<void> {
    if (command === '!prompt') {
      const prompt = discordMessage.content.slice(command.length).trim();
      discordMessage.channel.send('Processing prompt...');
      
      const response = await this.geminiService.sendToGemini(prompt);
      if (response.length > Number(process.env.DISCORD_MAX_LENGTH)) {
        discordMessage.channel.send('Sorry, the response is too long to send.');
        return;
      }
      
      if (response.length === 0) {
        discordMessage.channel.send('Sorry, the response is empty.');
        return;
      }

      discordMessage.channel.send(response);
    }
  }
}
