import {
    Plugin,
    Vault,
    Workspace,
    WorkspaceLeaf, 
  } from 'obsidian';
import MindmapView from './mindmap-view';
import { MM_VIEW_TYPE } from './constants';
import { MindMapSettings, MindMapSettingsOverride } from './settings';
import { MindMapSettingsTab } from './settings-tab';

  
  export default class MindMap extends Plugin {
    vault: Vault;
    workspace: Workspace;
    mindmapView: MindmapView;
    settings: MindMapSettings;
    
    async onload() {
      console.log("Loading Mind Map plugin");
      this.vault = this.app.vault;
      this.workspace = this.app.workspace;
      this.settings = Object.assign({
        splitDirection: 'Horizontal',
        nodeMinHeight: 16,
        lineHeight: '1em',
        spacingVertical: 5,
        spacingHorizontal: 80,
        paddingX: 8,
        initialExpandLevel: -1
    }, await this.loadData());

      this.registerView(
        MM_VIEW_TYPE,
        (leaf: WorkspaceLeaf) =>
          (this.mindmapView = new MindmapView(this.settings, leaf, {path:this.activeLeafPath(this.workspace), basename: this.activeLeafName(this.workspace)}))
      );
      
      this.addCommand({
        id: 'app:markmap-preview',
        name: 'Preview the current note as a Mind Map',
        callback: () => this.markMapPreview(),
        hotkeys: []
      });

      this.addCommand({
        id: 'app:markmap-unfold-all',
        name: 'Unfold All of the Mind Map',
        callback: () => this.markMapPreview({initialExpandLevel: -1}),
        hotkeys: []
      });

      this.addCommand({
        id: 'app:markmap-fold-level-1',
        name: 'Fold Level 1 for the Mind Map',
        callback: () => this.markMapPreview({initialExpandLevel: 1}),
        hotkeys: []
      });

      this.addCommand({
        id: 'app:markmap-fold-level-2',
        name: 'Fold Level 2 for the Mind Map',
        callback: () => this.markMapPreview({initialExpandLevel: 2}),
        hotkeys: []
      });

      this.addCommand({
        id: 'app:markmap-fold-level-3',
        name: 'Fold Level 3 for the Mind Map',
        callback: () => this.markMapPreview({initialExpandLevel: 3}),
        hotkeys: []
      });
      
      this.addCommand({
        id: 'app:markmap-fold-level-4',
        name: 'Fold Level 4 for the Mind Map',
        callback: () => this.markMapPreview({initialExpandLevel: 4}),
        hotkeys: []
      });

      this.addCommand({
        id: 'app:markmap-fold-level-5',
        name: 'Fold Level 5 for the Mind Map',
        callback: () => this.markMapPreview({initialExpandLevel: 5}),
        hotkeys: []
      });

      this.addSettingTab(new MindMapSettingsTab(this.app, this));

    }

    markMapPreview(settingsOverride?: MindMapSettingsOverride) {
      const fileInfo = {path: this.activeLeafPath(this.workspace), basename: this.activeLeafName(this.workspace)};
      this.initPreview(fileInfo, settingsOverride);
    }

    // initPreview redraws with potentially any settingsOverrides initiated from the commands.
    async initPreview(fileInfo: any, settingsOverride?: MindMapSettingsOverride) {
      var preview:WorkspaceLeaf;
      const mindmapLeaves = this.app.workspace.getLeavesOfType(MM_VIEW_TYPE);
      if (mindmapLeaves.length == 0) {
        preview = this.app.workspace.getLeaf('split', this.settings.splitDirection);
      } else {
        // Only allow one mindmap preview, so reuse
        preview = mindmapLeaves[0];
      }

      // With our leaf, draw the MindMap
      const mmPreview = new MindmapView({...this.settings, ...settingsOverride}, preview, fileInfo);
      preview.open(mmPreview);
    }
      
    onunload() {
      console.log("Unloading Mind Map plugin");
    }

    activeLeafPath(workspace: Workspace) {
      return workspace.activeLeaf?.view.getState().file;
    }

    activeLeafName(workspace: Workspace) {
      return workspace.activeLeaf?.getDisplayText();
    }



}