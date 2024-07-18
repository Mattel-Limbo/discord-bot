// discord.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Client, Message, GatewayIntentBits, DiscordAPIError } from 'discord.js';
import { title } from 'process';
import { timestamp } from 'rxjs';
import { GeminiService } from 'src/gemini/gemini.service';

@Injectable()
export class DiscordService {
  private readonly client: Client;
  private readonly logger = new Logger(DiscordService.name);
  private readonly token: string;

  /**
   * Initializes the Discord client with the necessary intents and sets the Discord bot token.
   *
   * This constructor is responsible for setting up the Discord client with the required intents (Guilds, GuildMessages, and MessageContent) and storing the Discord bot token from the environment variable `DISCORD_BOT_TOKEN`. It also logs a message to the logger indicating that the DiscordService has been initialized with the provided token.
   *
   * @param geminiService - An instance of the GeminiService, which is used for processing prompts.
   */
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

  /**
   * Initializes the Discord client, logs in the client, and sets up event handlers for handling logged-in client and message creation events.
   *
   * This method is called when the DiscordService module is initialized. It first sets up the event handlers for the logged-in client and message creation events, and then logs in the Discord client using the provided token.
   */
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
   * Handles the creation of Discord messages and processing of commands.
   *
   * This method listens for 'messageCreate' events from the Discord client and processes any messages that start with the '!prompt' command. It calls the `handlePrompt` method to process the prompt and send the response back to the message channel.
   *
   * If the message does not start with '!prompt', it logs an error message to the logger.
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
   * Handles the processing of a prompt received from a Discord message.
   *
   * When a message is received that starts with '!prompt', this function extracts the prompt from the message content, sends it to the GeminiService, and sends the response back to the message channel. If the response is too long, it sends a message indicating that the response is too long to send. If the response is empty, it sends a message indicating that the response is empty.
   *
   * @param discordMessage - The Discord message that was received.
   * @param command - The command that was used in the message (e.g. '!prompt').
   * @returns - A Promise that resolves when the prompt has been processed.
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
      console.log(response);

      discordMessage.channel.send(response);
      axios.post(process.env.DISCORD_WEBHOOK_URL, {
        title: prompt,
        description: response,
        timestamp: new Date(discordMessage.createdTimestamp).toISOString(),
        username: discordMessage.author.displayName,
        avatar: discordMessage.author.avatarURL(),
      }).then((response) => {
        // console.log(response.data);
      }).catch((error) => {
        console.log(error);
      });
    }
  }
}
