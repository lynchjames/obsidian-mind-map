import { INode } from 'markmap-common';
import { getLinkpath, Vault } from 'obsidian';
import { INTERNAL_LINK_REGEX } from './constants';

export default class ObsidianMarkmap {
    vaultName: string;

    constructor(vault: Vault) {
        this.vaultName = vault.getName();
    }

    updateInternalLinks(node: INode) {
        this.replaceInternalLinks(node);
        if(node.c){
            node.c.forEach(n => this.updateInternalLinks(n));
        }
    }

    private replaceInternalLinks(node: INode){
        const matches = this.parseValue(node.v);
        matches.forEach(match => {
            const linkText = match[1];
            const url = `obsidian://vault/${this.vaultName}/${encodeURI(getLinkpath(linkText))}`;
            const link = `<a href=\"${url}\">${linkText}</a>`;
            node.v = node.v.replace(/\[\[.*\]\]/, link);
        });
    }

    private parseValue(v: string) {
        const matches = [];
        let match;
        while(match = INTERNAL_LINK_REGEX.exec(v)){
            matches.push(match);
        }
        return matches;
    }

}