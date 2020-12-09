import { Notice } from 'obsidian';

export function copyImageToClipboard(svg: SVGElement) {
    const canvas = createCanvas(svg); 
    const img = generateImage(svg, canvas, () => { 
        canvas.toBlob((blob: any) => { 
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]); 
            new Notice('Screenshot copied to the clipboard.')
        });
    });
}

function createCanvas(svg: SVGElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = svg.clientWidth;
    canvas.height = svg.clientHeight;
    return canvas;
}

function generateImage(svg: SVGElement, canvas: HTMLCanvasElement, callback: () => void): HTMLImageElement {
    var ctx = canvas.getContext("2d");
    return drawInlineSVG(ctx, svg, callback);
}

function drawInlineSVG(ctx: CanvasRenderingContext2D, svg: SVGElement, callback: () => void): HTMLImageElement {

    // get svg data
    var xml = new XMLSerializer().serializeToString(svg);

    // make it base64
    var svg64 = btoa(xml);
    var b64Start = 'data:image/svg+xml;base64,';

    // prepend a "header"
    var image64 = b64Start + svg64;

    const img = new Image();
    // set it as the source of the img element
    img.onload = function() {
        // draw the image onto the canvas
        ctx.drawImage(img, 0, 0);
        callback();
    }
    img.src = image64;
    return img;
}