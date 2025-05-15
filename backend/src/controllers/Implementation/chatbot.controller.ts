import axios from 'axios';
import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { WORKSPHERE_SYSTEM_PROMPT } from '../../constants/geminiPromt';
import { fallbackAnswers } from '../../constants/fallbackResponses';

@injectable()
export class ChatbotController {
  constructor() {}

  public handleMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.body;
      if (!query) {
        res.status(400).json({ success: false, message: 'Query is required' });
        return;
      }

      const response = await this.getAIResponse(query);
      res.status(200).json({ success: true, message: response });
    } catch (error) {
      console.error('Chatbot error:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to process your request' });
    }
  };

  private getAIResponse = async (query: string): Promise<string> => {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('No Gemini API key found, using fallback responses');
      return this.getFallbackResponse(query);
    }

    try {
      const modelToUse = 'models/gemini-1.5-flash';
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/${modelToUse}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${WORKSPHERE_SYSTEM_PROMPT}\n\nUser question: ${query}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
        }
      );

      const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return result || this.getFallbackResponse(query);
    } catch (error: any) {
      console.error('Gemini API error:', error.response?.data || error.message);
      return this.getFallbackResponse(query);
    }
  };

  private getFallbackResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes('price') ||
      lowerQuery.includes('cost') ||
      lowerQuery.includes('plan')
    ) {
      return fallbackAnswers.pricing;
    } else if (
      lowerQuery.includes('feature') ||
      lowerQuery.includes('do') ||
      lowerQuery.includes('offer')
    ) {
      return fallbackAnswers.features;
    } else if (lowerQuery.includes('trial') || lowerQuery.includes('free')) {
      return fallbackAnswers.trial;
    } else if (
      lowerQuery.includes('support') ||
      lowerQuery.includes('help') ||
      lowerQuery.includes('contact')
    ) {
      return fallbackAnswers.support;
    } else if (
      lowerQuery.includes('mobile') ||
      lowerQuery.includes('app') ||
      lowerQuery.includes('phone')
    ) {
      return fallbackAnswers.mobile;
    } else if (
      lowerQuery.includes('setup') ||
      lowerQuery.includes('start') ||
      lowerQuery.includes('begin')
    ) {
      return fallbackAnswers.setup;
    } else {
      return fallbackAnswers.default;
    }
  };

  public validateApiConfig = (): boolean => {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Missing Gemini API key in environment variables');
      return false;
    }
    return true;
  };
}
