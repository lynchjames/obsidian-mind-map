import {
    App,
    PluginSettingTab,
    Setting,
    SplitDirection
} from 'obsidian';
import MindMap from './main';
  
  export class MindMapSettingsTab extends PluginSettingTab {
    plugin: MindMap;
    constructor(app: App, plugin: MindMap) {
      super(app, plugin);
      this.plugin = plugin;
    }
  
    display(): void {
      const { containerEl } = this;
  
      containerEl.empty();

      new Setting(containerEl)
        .setName('Preview Split')
        .setDesc('Split direction for the Mind Map Preview')
        .addDropdown(dropDown => 
          dropDown
            .addOption('horizontal', 'Horizontal')
            .addOption('vertical', 'Vertical')
            .setValue(this.plugin.settings.splitDirection || 'horizontal')
            .onChange((value:string) => {
              this.plugin.settings.splitDirection = value as SplitDirection;
              this.plugin.saveData(this.plugin.settings);
            }));
        }

  }