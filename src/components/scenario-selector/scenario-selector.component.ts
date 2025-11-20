
import { Component, ChangeDetectionStrategy, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scenario-selector',
  templateUrl: './scenario-selector.component.html',
  imports: [CommonModule],
})
export class ScenarioSelectorComponent {
  readonly disabled = input<boolean>(false);
  readonly scenarioSelected = output<string>();

  scenarios: string[] = [
    'Battle of Uhud',
    'Conquest of Mecca',
    'Battle of Yarmouk',
    'Battle of Walaja',
    'Siege of Damascus',
    'Battle of the Chains',
    'Ridda Wars'
  ];

  selectScenario(scenario: string) {
    this.scenarioSelected.emit(scenario);
  }
}
