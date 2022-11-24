import { EventRef, ItemView, Menu, Vault, Workspace, WorkspaceLeaf } from 'obsidian';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { INode } from 'markmap-common';
import { FRONT_MATTER_REGEX, MD_VIEW_TYPE, MM_VIEW_TYPE } from './constants';
import ObsidianMarkmap from './obsidian-markmap-plugin';
import { createSVG, removeExistingSVG } from './markmap-svg';
import { copyImageToClipboard } from './copy-image';
import { MindMapSettings } from './settings';

export default class MindmapView extends ItemView {
    filePath: string;
    fileName: string;
    linkedLeaf: WorkspaceLeaf;
    displayText: string;
    currentMd: string;
    vault: Vault;
    workspace: Workspace;
    listeners: EventRef[];
    emptyDiv: HTMLDivElement;
    svg: SVGElement;
    obsMarkmap: ObsidianMarkmap;
    isLeafPinned: boolean;
    pinAction: HTMLElement;
    settings: MindMapSettings;

    getViewType(): string {
        return MM_VIEW_TYPE;
    }

    getDisplayText(): string {
        return this.displayText ?? 'Mind Map';
    }

    getIcon() {
        return "dot-network";
    }

    onMoreOptionsMenu(menu: Menu) {    
        menu
        .addItem((item) => 
            item
            .setIcon('pin')
            .setTitle('Pin')
            .onClick(() => this.pinCurrentLeaf())
        )
        .addSeparator()
        .addItem((item) => 
            item
            .setIcon('image-file')
            .setTitle('Copy screenshot')
            .onClick(() => copyImageToClipboard(this.svg))  
        );
        menu.showAtPosition({x: 0, y: 0});
    }

    constructor(settings: MindMapSettings, leaf: WorkspaceLeaf, initialFileInfo: {path:string, basename:string}){
        super(leaf);
        this.settings = settings;
        this.filePath = initialFileInfo.path;
        this.fileName = initialFileInfo.basename; 
        this.vault = this.app.vault;
        this.workspace = this.app.workspace;
    }

    async onOpen() {
        this.obsMarkmap = new ObsidianMarkmap(this.vault);
        this.registerActiveLeafUpdate();
        this.workspace.onLayoutReady(() => this.update()),
        this.listeners = [
            this.workspace.on('resize', () => this.update()),
            this.workspace.on('css-change', () => this.update()),
            this.leaf.on('group-change', (group) => this.updateLinkedLeaf(group, this))
        ];
    }

    async onClose() {
        this.listeners.forEach(listener => this.workspace.offref(listener));
    }

    registerActiveLeafUpdate() {
        this.registerInterval(
            window.setInterval(() => this.checkAndUpdate(), 1000)
        );
    }
    
    async checkAndUpdate() {
        try {
            if(await this.checkActiveLeaf()) {
                this.update();
            }
        } catch (error) {
            console.error(error)
        }
    }

    updateLinkedLeaf(group: string, mmView: MindmapView) {
        if(group === null) {
            mmView.linkedLeaf = undefined;
            return;
        }
        const mdLinkedLeaf = mmView.workspace.getGroupLeaves(group).filter(l => l.view.getViewType() === MM_VIEW_TYPE)[0];
        mmView.linkedLeaf = mdLinkedLeaf;
        this.checkAndUpdate();
    }

    pinCurrentLeaf() {
        this.isLeafPinned = true;
        this.pinAction = this.addAction('filled-pin', 'Pin', () => this.unPin(), 20);
        this.pinAction.addClass('is-active');
    }

    unPin() {
        this.isLeafPinned = false;
        this.pinAction.parentNode.removeChild(this.pinAction);
    }

    async update(){
        if(this.filePath) {
            await this.readMarkDown();
            if(this.currentMd.length === 0 || this.getLeafTarget().view.getViewType() != MD_VIEW_TYPE){
                this.displayEmpty(true);
                removeExistingSVG();
            } else {
                const { root, features } = await this.transformMarkdown();
                this.displayEmpty(false);
                this.svg = createSVG(this.containerEl, this.settings.lineHeight);
                this.renderMarkmap(root, this.svg);
            }
        }
        this.displayText = this.fileName != undefined ? `Mind Map of ${this.fileName}` : 'Mind Map'; 
        this.load();
    }

    async checkActiveLeaf() {
        if(this.app.workspace.activeLeaf.view.getViewType() === MM_VIEW_TYPE){
            return false;
        }
        const pathHasChanged = this.readFilePath();
        const markDownHasChanged = await this.readMarkDown();
        const updateRequired = pathHasChanged || markDownHasChanged;
        return updateRequired;
    }

    readFilePath() {
        const fileInfo = (this.getLeafTarget().view as any).file;
        const pathHasChanged = this.filePath != fileInfo.path;
        this.filePath = fileInfo.path;
        this.fileName = fileInfo.basename;
        return pathHasChanged;
    }
    
    getLeafTarget() {
        if(!this.isLeafPinned){
            this.linkedLeaf = this.app.workspace.activeLeaf;
        }
        return this.linkedLeaf != undefined ? this.linkedLeaf : this.app.workspace.activeLeaf;
    }

    async readMarkDown() {
        let md = await this.app.vault.adapter.read(this.filePath);
        if(md.startsWith('---')) {
            md = md.replace(FRONT_MATTER_REGEX, '');
        }
        const markDownHasChanged = this.currentMd != md;
        this.currentMd = md;
        return markDownHasChanged;
    }
    
    async transformMarkdown() {
        const { root, features } = new Transformer().transform(this.currentMd);
        this.obsMarkmap.updateInternalLinks(root);
        return { root, features };
    }
    
    async renderMarkmap(root: INode, svg: SVGElement) {
        const options = {
          ...Markmap.defaultOptions,
          ...{
              autoFit: false,
              duration: 10,
              nodeMinHeight: this.settings.nodeMinHeight ?? 16,
              spacingVertical: this.settings.spacingVertical ?? 5,
              spacingHorizontal: this.settings.spacingHorizontal ?? 80,
              paddingX: this.settings.paddingX ?? 8
            }
          };
          try {
            const markmapSVG = Markmap.create(svg, options, root);
          } catch (error) {
              console.error(error);
          }
    }

    displayEmpty(display: boolean) {
        if(this.emptyDiv === undefined) {
            const div = document.createElement('div')
            div.className = 'pane-empty';
            div.innerText = 'No content found';
            removeExistingSVG();
            this.containerEl.children[1].appendChild(div);
            this.emptyDiv = div;
        } 
        this.emptyDiv.toggle(display);
    }
}