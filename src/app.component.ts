import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';
import { ScenarioSelectorComponent } from './components/scenario-selector/scenario-selector.component';
import { StoryDisplayComponent } from './components/story-display/story-display.component';
import { EquipmentDisplayComponent } from './components/equipment-display/equipment-display.component';
import { ThreeDViewerComponent } from './components/three-d-viewer/three-d-viewer.component';
import { Story } from './models/story.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ScenarioSelectorComponent, StoryDisplayComponent, EquipmentDisplayComponent, ThreeDViewerComponent],
})
export class AppComponent {
  private geminiService = new GeminiService();
  private loadingInterval: any;

  readonly story = signal<Story | null>(null);
  readonly error = signal<string | null>(null);
  readonly viewState = signal<'menu' | 'loading' | 'briefing'>('menu');
  readonly loadingText = signal<string>('');

  async onScenarioSelected(scenario: string) {
    if (!scenario) return;

    this.viewState.set('loading');
    this.story.set(null);
    this.error.set(null);
    this.startLoadingMessages();

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
      this.viewState.set('briefing');

    } catch (err) {
      console.error('Error generating content:', err);
      this.error.set('The bards have lost their voice. The ancient tale could not be recalled. Please try again.');
      this.viewState.set('menu'); // Go back to menu on error
    } finally {
      this.stopLoadingMessages();
    }
  }

  returnToMenu() {
    this.story.set(null);
    this.error.set(null);
    this.viewState.set('menu');
  }

  private startLoadingMessages() {
    const messages = [
      'Consulting the ancient scrolls...',
      'Scouting the desert sands...',
      'Sharpening the scimitars...',
      'Rallying the warriors...',
      'Recalling the epic sagas...'
    ];
    this.loadingText.set(messages[0]);
    let index = 1;
    this.loadingInterval = setInterval(() => {
      this.loadingText.set(messages[index % messages.length]);
      index++;
    }, 2000);
  }

  private stopLoadingMessages() {
    clearInterval(this.loadingInterval);
  }
}
