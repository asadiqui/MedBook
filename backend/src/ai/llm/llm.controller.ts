import { Controller, Post, Body, Res, HttpException, HttpStatus, Req, Get, Param, Delete } from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { LlmService, RATE_LIMIT_ERROR_MESSAGE, DAILY_LIMIT_ERROR_MESSAGE } from './llm.service';
import { RagService } from '../rag/rag.service';

const SYMPTOM_CHECKER_PROMPT = `
  Act as a medical assistant.
  Please provide a brief summary for the doctor to read before the appointment based on the patient's description.
  Include potential conditions but emphasize that this is not a diagnosis.
  Keep it professional and concise.
`;

@Controller('ai/llm')
export class LlmController {
  constructor(
    private readonly llmService: LlmService,
    private readonly ragService: RagService,
  ) {}

  @Get('history/:agentId')
  async getHistory(@Param('agentId') agentId: string, @Req() req: any) {
    const userId = req.user.id;
    return this.llmService.getHistory(userId, agentId);
  }

  @Delete('history/:agentId')
  async clearHistory(@Param('agentId') agentId: string, @Req() req: any) {
    const userId = req.user.id;
    return this.llmService.clearHistory(userId, agentId);
  }

  @Post('chat')
  // @Throttle({ default: { limit: 20, ttl: 60000 } }) // Removing per-user throttle in favor of global service limit
  async chat(
    @Body('agentId') agentId: string,
    @Body('message') message: string,
    @Body('history') history: any[] = [],
    @Req() req: any,
  ) {
    try {
      const userId = req.user.id;
      if (agentId === 'rag') {
        return { text: await this.ragService.query(userId, message, history) };
      }
      
      if (agentId === 'llm' || agentId === 'symptom-checker') {
         return { text: await this.llmService.chat(userId, 'llm', message, SYMPTOM_CHECKER_PROMPT) };
      }

      throw new HttpException('Invalid agentId', HttpStatus.BAD_REQUEST);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage === RATE_LIMIT_ERROR_MESSAGE) {
        throw new HttpException(errorMessage, HttpStatus.TOO_MANY_REQUESTS);
      }
      if (errorMessage === DAILY_LIMIT_ERROR_MESSAGE) {
        throw new HttpException(errorMessage, HttpStatus.FORBIDDEN); // Or 402/429
      }
      
      throw new HttpException('Failed to process chat request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('chat/stream')
  // Removed strict explicit throttle for stream, checks default or global limits if any
  async chatStream(
    @Body('agentId') agentId: string,
    @Body('message') message: string,
    @Body('history') history: any[] = [],
    @Res() res: Response,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    if (agentId === 'rag') {
      // Basic streaming simulation for RAG (can be improved later)
      const text = await this.ragService.query(userId, message, history);
      res.write(text);
      res.end();
      return;
    }

    if (agentId !== 'llm' && agentId !== 'symptom-checker') {
       res.status(400).json({ message: 'Invalid agentId' });
       return;
    }

    try {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      const stream = this.llmService.chatStream(userId, 'llm', message, SYMPTOM_CHECKER_PROMPT);
      
      for await (const chunk of stream) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      console.error('Stream processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check for upstream rate limit (429) from Gemini
      if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes(RATE_LIMIT_ERROR_MESSAGE)) {
          if (!res.headersSent) {
            res.status(429).json({ message: errorMessage.includes(RATE_LIMIT_ERROR_MESSAGE) ? RATE_LIMIT_ERROR_MESSAGE : 'AI Service is busy. Please try again later.' });
            return;
          }
      }

      if (errorMessage.includes(DAILY_LIMIT_ERROR_MESSAGE)) {
        if (!res.headersSent) {
          res.status(403).json({ message: DAILY_LIMIT_ERROR_MESSAGE });
          return;
        }
      }

      // If headers haven't been sent, we can send a proper JSON error
      if (!res.headersSent) {
        res.status(500).json({ 
          message: 'Error generating response', 
          details: errorMessage
        });
      } else {
        // If stream already started, end it.
        // We could optionally write an error marker here if the client supports it.
        res.end();
      }
    }
  }

  @Post('symptom-checker')
  async checkSymptoms(@Body('symptoms') symptoms: string, @Req() req: any) {
    const userId = req.user.id;
    const message = `A patient has described the following symptoms: "${symptoms}".`;
    // Treat 'symptom-checker' requests as 'llm' agent interactions for history consistency
    return this.llmService.chat(userId, 'llm', message, SYMPTOM_CHECKER_PROMPT);
  }
}
