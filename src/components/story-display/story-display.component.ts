
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Story } from '../../models/story.model';

@Component({
  selector: 'app-story-display',
  templateUrl: './story-display.component.html',
  imports: [CommonModule],
})
export class StoryDisplayComponent {
  readonly story = input.required<Story>();
}
