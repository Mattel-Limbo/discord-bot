import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'

/**
 * Bootstraps the NestJS application by creating the `AppModule` and starting the server on port 3000.
 *
 * This function is the entry point of the application and should be called to start the server.
 */
async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
