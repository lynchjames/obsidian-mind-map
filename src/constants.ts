export const MM_VIEW_TYPE = 'mindmap';
export const MD_VIEW_TYPE = 'markdown'; 

// https://regex101.com/r/gw85cc/2
export const INTERNAL_LINK_REGEX = /\[\[(?<wikitext>.*)\]\]|<a href="(?<mdpath>.*)">(?<mdtext>.*)<\/a>/gim;

// https://regex101.com/r/Yg7HuO/2
export const FRONT_MATTER_REGEX = /^(---)$.+?^(---)$.+?/ims;