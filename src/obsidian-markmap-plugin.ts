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
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const isWikiLink = match.groups['wikitext'];
            var linkText, linkPath;
            if (isWikiLink) {
                linkText = match.groups['wikialias'] ? match.groups['wikialias'] : match.groups['wikitext'];
                linkPath = match.groups['wikitext'];
            } else {
                linkText = match.groups['mdtext'];
                linkPath = match.groups['mdpath'];
            }
            if(linkPath.startsWith('http')){
                continue;
            }
            const url = `obsidian://open?vault=${this.vaultName}&file=${isWikiLink ? encodeURI(getLinkpath(linkPath)) : linkPath}`;
            const link = `<a href=\"${url}\">${linkText}</a>`;
            node.v = node.v.replace(match[0], link);
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
