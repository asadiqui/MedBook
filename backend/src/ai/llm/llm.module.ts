import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { ConfigModule } from '@nestjs/config';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [ConfigModule, RagModule],
  controllers: [LlmController],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
