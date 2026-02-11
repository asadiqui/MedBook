import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../../prisma/prisma.service';

export const RATE_LIMIT_ERROR_MESSAGE = 'System Busy, please try again in 5 seconds';
export const DAILY_LIMIT_ERROR_MESSAGE = 'You have reached your daily limit. You can try again tomorrow.';

@Injectable()
export class LlmService {
  private groq: Groq;
  private modelName = 'llama-3.3-70b-versatile';
  private readonly DAILY_TOKEN_LIMIT = 20000;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('LLM_API_KEY');
    
    // Load model from env if available
    this.modelName = this.configService.get<string>('LLM_MODEL') || this.modelName;

    if (!apiKey) {
      console.warn('LLM_API_KEY is not set in environment variables');
    }
    this.groq = new Groq({ apiKey: apiKey || 'dummy' });
  }

  private getDateKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private async checkDailyLimit(userId: string) {
    const date = this.getDateKey();
    const usage = await this.prisma.userAiUsage.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (usage && usage.tokenCount >= this.DAILY_TOKEN_LIMIT) {
      throw new Error(DAILY_LIMIT_ERROR_MESSAGE);
    }
  }

  private async trackUsage(userId: string, tokens: number) {
    if (!tokens || tokens <= 0) return;
    
    const date = this.getDateKey();
    await this.prisma.userAiUsage.upsert({
      where: { userId_date: { userId, date } },
      update: { tokenCount: { increment: tokens } },
      create: { userId, date, tokenCount: tokens },
    });
  }

  async chat(userId: string, agentId: string, message: string, systemInstruction?: string): Promise<string> {
    try {
      await this.checkDailyLimit(userId);

      // 1. Fetch History
      const previousHistory = await this.prisma.aiMessage.findMany({
        where: { userId, agentId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      // 2. Format History for Groq
      const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];
      
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }

      const historyMessages = previousHistory.reverse().map(h => ({
         role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
         content: h.content,
      }));
      messages.push(...historyMessages);

      // 3. Add Current Message
      messages.push({ role: 'user', content: message });

      // 4. Save User Message to DB (if not just probing)
      await this.prisma.aiMessage.create({
        data: { userId, agentId, role: 'user', content: message },
      });

      // 5. Call Groq
      const completion = await this.groq.chat.completions.create({
        messages,
        model: this.modelName,
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content || '';
      const tokens = completion.usage?.total_tokens || 0;
      await this.trackUsage(userId, tokens);

      // 6. Save Assistant Response to DB
      if (responseText) {
        await this.prisma.aiMessage.create({
          data: { userId, agentId, role: 'assistant', content: responseText },
        });
      }

      return responseText;

    } catch (error) {
       console.error('Error in chat generation:', error);
       throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async *chatStream(userId: string, agentId: string, message: string, systemInstruction?: string): AsyncGenerator<string> {
    try {
      await this.checkDailyLimit(userId);

      const previousHistory = await this.prisma.aiMessage.findMany({
        where: { userId, agentId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];
      
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }

      const historyMessages = previousHistory.reverse().map(h => ({
         role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
         content: h.content,
      }));
      messages.push(...historyMessages);
      messages.push({ role: 'user', content: message });

      await this.prisma.aiMessage.create({
        data: { userId, agentId, role: 'user', content: message },
      });

      const stream = await this.groq.chat.completions.create({
        messages,
        model: this.modelName,
        temperature: 0.7,
        stream: true,
        stream_options: { include_usage: true } 
      } as any);
      
      let fullResponse = '';
      let usageFound = false;

      for await (const chunk of (stream as any)) {
        const content = chunk.choices?.[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          yield content;
        }

        // Check for usage in the chunk (usually last chunk)
        // Groq/OpenAI format: chunk.usage or chunk.x_groq.usage
        // @ts-ignore
        const usage = chunk.usage || chunk.x_groq?.usage;
        if (usage && !usageFound) {
            usageFound = true;
            await this.trackUsage(userId, usage.total_tokens);
        }
      }

      if (fullResponse) {
        await this.prisma.aiMessage.create({
          data: { userId, agentId, role: 'assistant', content: fullResponse },
        });
      }

    } catch (error) {
       console.error('Error in chat stream generation:', error);
       throw new Error(`Failed to generate chat stream: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getHistory(userId: string, agentId: string) {
    const messages = await this.prisma.aiMessage.findMany({
      where: { userId, agentId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return messages.reverse();
  }

  async clearHistory(userId: string, agentId: string) {
    await this.prisma.aiMessage.deleteMany({
      where: { userId, agentId },
    });
    return { success: true };
  }
}
