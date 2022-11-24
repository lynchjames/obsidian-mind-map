import { SplitDirection } from 'obsidian';

export class MindMapSettings {
    splitDirection: SplitDirection = 'horizontal';
    nodeMinHeight: number = 16;
    lineHeight: string = '1em';
    spacingVertical: number = 5;
    spacingHorizontal: number = 80;
    paddingX: number = 8;
    initialExpandLevel: number = -1;
}

// Not saved, but for optional command rendering overrides. Properties must be in sync.
export class MindMapSettingsOverride {
    splitDirection?: SplitDirection
    nodeMinHeight?: number;
    lineHeight?: string;
    spacingVertical?: number;
    spacingHorizontal?: number;
    paddingX?: number;
    initialExpandLevel?: number;
}