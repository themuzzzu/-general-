import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Equipment } from '../models/equipment.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: This relies on the API_KEY being set in the environment
    // where the application is hosted. Do not hardcode keys.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY environment variable not set.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateStory(scenario: string): Promise<string> {
    const prompt = `You are a master storyteller, in the style of an epic historical saga. Write a short, dramatic, and vivid paragraph (no more than 150 words) about the legendary warrior Khalid ibn al-Walid during the "${scenario}". Focus on his strategic genius and bravery. The tone should be like a scene from a classic historical movie.`;
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating story:', error);
      throw new Error('Failed to generate story from Gemini API.');
    }
  }

  async generateImagePrompt(scenario: string): Promise<string> {
      return `Cinematic, dramatic, realistic oil painting of the Arab general Khalid ibn al-Walid, the Sword of Allah, during the ${scenario}. Epic historical art style, desert landscape, dynamic lighting, high detail. Resembles the art style of Red Dead Redemption 2.`;
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      });
      
      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
      }
      throw new Error('No image was generated.');

    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image from Gemini API.');
    }
  }

  async generateEquipmentList(scenario: string): Promise<Equipment[]> {
    const prompt = `Generate a list of 5 historically accurate weapons and armor from the early Islamic conquests period (circa 7th century CE) during the time of Khalid ibn al-Walid and the "${scenario}". Format the response as a JSON array. For each item, include its name, type (Weapon or Armor), description, appearance, and game-like stats for combat effectiveness (damage, range, speed), and availability. The tone should be suitable for a game like Red Dead Revolver.`;

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Weapon', 'Armor'] },
          description: { type: Type.STRING },
          appearance: { type: Type.STRING },
          damage: { type: Type.STRING },
          range: { type: Type.STRING },
          speed: { type: Type.STRING },
          availability: { type: Type.STRING },
        },
        required: ['name', 'type', 'description', 'appearance', 'damage', 'range', 'speed', 'availability']
      },
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });
      
      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr) as Equipment[];
    } catch (error) {
      console.error('Error generating equipment list:', error);
      throw new Error('Failed to generate equipment list from Gemini API.');
    }
  }
}
