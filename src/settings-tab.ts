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
                    .onChange((value: string) => {
                        this.plugin.settings.splitDirection = value as SplitDirection;
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Node Min Height')
            .setDesc('Minimum height for the mind map nodes')
            .addText(text =>
                text
                    .setValue(this.plugin.settings.nodeMinHeight?.toString())
                    .setPlaceholder('Example: 16')
                    .onChange((value: string) => {
                        this.plugin.settings.nodeMinHeight = Number.parseInt(value);
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Node Text Line Height')
            .setDesc('Line height for content in mind map nodes')
            .addText(text =>
                text
                    .setValue(this.plugin.settings.lineHeight?.toString())
                    .setPlaceholder('Example: 1em')
                    .onChange((value: string) => {
                        this.plugin.settings.lineHeight = value;
                        this.plugin.saveData(this.plugin.settings);
                    }));


        new Setting(containerEl)
            .setName('Vertical Spacing')
            .setDesc('Vertical spacing of the mind map nodes')
            .addText(text =>
                text
                    .setValue(this.plugin.settings.spacingVertical?.toString())
                    .setPlaceholder('Example: 5')
                    .onChange((value: string) => {
                        this.plugin.settings.spacingVertical = Number.parseInt(value);
                        this.plugin.saveData(this.plugin.settings);
                    }));


        new Setting(containerEl)
            .setName('Horizontal Spacing')
            .setDesc('Horizontal spacing of the mind map nodes')
            .addText(text =>
                text
                    .setValue(this.plugin.settings.spacingHorizontal?.toString())
                    .setPlaceholder('Example: 80')
                    .onChange((value: string) => {
                        this.plugin.settings.spacingHorizontal = Number.parseInt(value);
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Horizontal padding')
            .setDesc('Leading space before the content of mind map nodes')
            .addText(text =>
                text
                    .setValue(this.plugin.settings.paddingX?.toString())
                    .setPlaceholder('Example: 8')
                    .onChange((value: string) => {
                        this.plugin.settings.paddingX = Number.parseInt(value);
                        this.plugin.saveData(this.plugin.settings);
                    }));
        
        new Setting(containerEl)
            .setName('Initial Expand Level')
            .setDesc('How many nodes to initially have expanded when opening the mind map (default of -1 expands all)')
            .addText(text =>
                text
                    .setValue(this.plugin.settings.initialExpandLevel?.toString())
                    .setPlaceholder('Example: 3')
                    .onChange((value: string) => {
                        this.plugin.settings.initialExpandLevel = Number.parseInt(value);
                        this.plugin.saveData(this.plugin.settings);
                    }));
    }
}