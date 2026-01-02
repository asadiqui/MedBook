import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmModule } from './ai/llm/llm.module';

@Module({
  imports: [
    // ConfigModule loads the .env file so we can read the API Key
    ConfigModule.forRoot({
      isGlobal: true, // Makes .env variables available everywhere
    }),
    // We "plug in" our LlmModule here so the app knows it exists
    LlmModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
