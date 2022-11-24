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
        if(node.children){
            node.children.forEach(n => this.updateInternalLinks(n));
        }
    }

    private replaceInternalLinks(node: INode){
        const matches = this.parseValue(node.content);
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const isWikiLink = match.groups['wikitext'];
            const linkText = isWikiLink ? match.groups['wikitext'] : match.groups['mdtext'];
            const linkPath = isWikiLink ? linkText : match.groups['mdpath'];
            if(linkPath.startsWith('http')){
                continue;
            }
            const url = `obsidian://open?vault=${this.vaultName}&file=${isWikiLink ? encodeURI(getLinkpath(linkPath)) : linkPath}`;
            const link = `<a href=\"${url}\">${linkText}</a>`;
            node.content = node.content.replace(match[0], link);
        }
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