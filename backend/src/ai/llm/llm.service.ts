import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LlmService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly logger = new Logger(LlmService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  async checkSymptoms(symptoms: string): Promise<string> {
    const prompt = `
      Act as a medical assistant. A patient has described the following symptoms: "${symptoms}".
      Please provide a brief summary for the doctor to read before the appointment. 
      Include potential conditions but emphasize that this is not a diagnosis.
      Keep it professional and concise.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error(
        'Error generating content',
        error instanceof Error ? error.stack : `${error}`,
      );
      throw new Error('Failed to process symptoms');
    }
  }
}
