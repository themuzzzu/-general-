import { Component, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';
import { ScenarioSelectorComponent } from './components/scenario-selector/scenario-selector.component';
import { StoryDisplayComponent } from './components/story-display/story-display.component';
import { EquipmentDisplayComponent } from './components/equipment-display/equipment-display.component';
import { Story } from './models/story.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ScenarioSelectorComponent, StoryDisplayComponent, EquipmentDisplayComponent],
})
export class AppComponent {
  private geminiService = new GeminiService();

  readonly story = signal<Story | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {}

  async onScenarioSelected(scenario: string) {
    if (!scenario) return;

    this.isLoading.set(true);
    this.story.set(null);
    this.error.set(null);

    try {
      const storyTextPromise = this.geminiService.generateStory(scenario);
      const imagePromptPromise = this.geminiService.generateImagePrompt(scenario);
      
      const [storyText, imagePrompt] = await Promise.all([storyTextPromise, imagePromptPromise]);
      
      const imageBase64 = await this.geminiService.generateImage(imagePrompt);

      this.story.set({
        title: scenario,
        text: storyText,
        imageUrl: `data:image/jpeg;base64,${imageBase64}`
      });

    } catch (err) {
      console.error('Error generating content:', err);
      this.error.set('The bards have lost their voice. The ancient tale could not be recalled. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
