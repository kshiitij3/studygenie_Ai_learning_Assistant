import fs from 'fs/promises';

const ensurePdfGlobals = () => {
  if (typeof global.DOMMatrix === 'undefined') {
    global.DOMMatrix = class DOMMatrix {
      constructor() {
        return this;
      }
    };
  }

  if (typeof global.ImageData === 'undefined') {
    global.ImageData = class ImageData {
      constructor(data, width, height) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    };
  }

  if (typeof global.Path2D === 'undefined') {
    global.Path2D = class Path2D {
      constructor(_path) {
        this.path = _path;
      }
    };
  }
};

/**
 * Extract text from pdf file
 * @param {string} filePath =path to PDFfile
 * @return {promise<{text: string,numpages:number}>}
 * */
export const extractTextFromPDF = async (filePath) => {
  try {
    ensurePdfGlobals();
    const dataBuffer = await fs.readFile(filePath);
    ////pdf-parse expects a Unit8Array, not a buffer
    const pdfParseModule = await import('pdf-parse');
    const pdfParseFn = pdfParseModule.default || pdfParseModule;
    const data = await pdfParseFn(dataBuffer);

    return {
      text: data.text || '',
      numPages: data.numpages ?? data.numPages ?? 0,
      info: data.info,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('failed to extract text from file');
  }
};
