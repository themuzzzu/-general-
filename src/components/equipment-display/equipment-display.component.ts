import { Component, ChangeDetectionStrategy, input, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { Equipment } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-display',
  templateUrl: './equipment-display.component.html',
  imports: [CommonModule],
})
export class EquipmentDisplayComponent {
  readonly scenario = input.required<string>();
  private readonly geminiService = inject(GeminiService);

  readonly equipment = signal<Equipment[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(async () => {
      const currentScenario = this.scenario();
      if (!currentScenario) return;

      this.isLoading.set(true);
      this.equipment.set([]);
      this.error.set(null);

      try {
        const equipmentList = await this.geminiService.generateEquipmentList(currentScenario);
        this.equipment.set(equipmentList);
      } catch (err) {
        console.error('Error fetching equipment:', err);
        this.error.set('Failed to retrieve arsenal details. The quartermaster is unavailable.');
      } finally {
        this.isLoading.set(false);
      }
    }, { allowSignalWrites: true });
  }
}
