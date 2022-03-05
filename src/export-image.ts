import { Notice } from 'obsidian';

export async function exportSVG( svg: SVGElement ) {
  const dialog = require( 'electron' ).remote.dialog;
  const fs     = require( 'fs' )

  const filePath = dialog.showSaveDialogSync( {
    filters   : [
      { name: 'SVG File', extensions: ['svg'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['createDirectory', 'treatPackageAsDirectory', 'showOverwriteConfirmation'],
  } )

  if( filePath ) {
    const content = new Blob( [`${getSVGContent( svg )}`], { type: 'image/svg+xml' } )

    const fsWriteStream  = fs.createWriteStream( filePath )
    const writableStream = new WritableStream( fsWriteStream )
    content.stream().pipeTo( writableStream ).then( () => {
      new Notice( `Export successfully` )
    } ).catch( ( error: Error ) => {
      new Notice( `Export failed! ${error.message}` )
      console.error( error )
    } )
  }
}

/**
 * Create a svg file's content which needs to be a conforming SVG stand-alone file.
 *
 * [W3C specifications and standards](https://www.w3.org/TR/SVG2/conform.html#ConformingSVGStandAloneFiles)
 *
 * @param svg
 */
function getSVGContent( svg: SVGElement ): string {
  const xmlVersion     = '1.1'
  const svgVersion     = '1.1'
  const svgBaseProfile = 'full'
  const svgXmlns       = 'http://www.w3.org/2000/svg'
  const svgXmlnsXlink  = 'http://www.w3.org/1999/xlink'
  const svgXmlnsEv     = 'http://www.w3.org/2001/xml-events'

  return `<?xml version="${xmlVersion}"?>
  <svg version="${svgVersion}"
  baseProfile="${svgBaseProfile}"
  xmlns="${svgXmlns}"
  xmlns:xlink="${svgXmlnsXlink}"
  xmlns:ev="${svgXmlnsEv}">
  ${svg.innerHTML}
  </svg>`;
}
