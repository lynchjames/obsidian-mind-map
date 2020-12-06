import { EventRef, ItemView, Vault, Workspace, WorkspaceLeaf } from 'obsidian';
import { transform, IFeatures } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { INode } from 'markmap-common';
import { MM_VIEW_TYPE } from './constants';
import ObsidianMarkmap from './obsidian-markmap-plugin';

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
    obsMarkmap: ObsidianMarkmap;

    getViewType(): string {
        return MM_VIEW_TYPE;
    }

    getDisplayText(): string {
        return this.displayText ?? 'Mind Map';
    }

    getIcon() {
        return "dot-network";
    }

    constructor(leaf: WorkspaceLeaf, initialFileInfo: {path:string, basename:string}){
        super(leaf);
        this.filePath = initialFileInfo.path;
        this.fileName = initialFileInfo.basename; 
        this.vault = this.app.vault;
        this.workspace = this.app.workspace;
    }

    async onOpen() {
        this.obsMarkmap = new ObsidianMarkmap(this.vault);
        this.registerActiveLeafUpdate();
        this.listeners = [
            this.workspace.on('layout-ready', () => this.update()),
            this.workspace.on('resize', () => this.update()),
            this.workspace.on('css-change', () => this.update()),
        ];
        // this.leaf.on('group-change', (group) => this.updateLinkedLeaf(group, this));
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
            console.log(error)
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

    async update(){
        if(this.filePath) {
            await this.readMarkDown();
            if(this.currentMd.length === 0){
                this.displayEmpty(true);
                this.removeExistingSVG();
            } else {
                const { root } = await this.transformMarkdown();
                this.displayEmpty(false);
                const svg = this.createSVG();
                this.renderMarkmap(root, svg);
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
    
    getLeafTarget() {;
        return this.linkedLeaf != undefined ? this.linkedLeaf : this.app.workspace.activeLeaf;
    }

    async readMarkDown() {
        const md = await this.app.vault.adapter.read(this.filePath);
        const markDownHasChanged = this.currentMd != md;
        this.currentMd = md;
        return markDownHasChanged;
    }
    
    async transformMarkdown() {
        const { root, features } = transform(this.currentMd);
        this.obsMarkmap.updateInternalLinks(root);
        return { root, features };
    }
    
    createSVG(): SVGElement {
        this.removeExistingSVG();
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as SVGElement;
        svg.id = 'markmap';
        svg.setAttr('style', 'height: 100%; width: 100%');
        const container = this.containerEl.children[1];
        container.appendChild(svg);
        return svg;
    }

    removeExistingSVG() {
        const existing = document.getElementById('markmap');
        if(existing) {
            existing.parentElement.removeChild(existing);
        }
    }
    
    async renderMarkmap(root: INode, svg: SVGElement) {
        const options = {
            autoFit: false,
            duration: 10
          };
          try {
            const markmapSVG = Markmap.create(svg, options, root);
          } catch (error) {
              console.log(error);
          }
    }

    displayEmpty(display: boolean) {
        if(this.emptyDiv === undefined) {
            const div = document.createElement('div')
            div.className = 'pane-empty';
            div.innerText = 'No content found';
            this.removeExistingSVG();
            this.containerEl.children[1].appendChild(div);
            this.emptyDiv = div;
        } 
        const style = display ? 'display: block' : 'display: none';
        this.emptyDiv.setAttr('style', style);
    }
}