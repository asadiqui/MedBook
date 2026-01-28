import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('ai/llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('symptom-checker')
  async checkSymptoms(@Body('symptoms') symptoms: string) {
    return this.llmService.checkSymptoms(symptoms);
  }
}
