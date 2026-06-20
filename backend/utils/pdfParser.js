import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF buffer
 * @param{Buffer|Uint8Array} pdfBuffer - PDF file buffer
 * @returns {Promise<{text: string, numPages: number}>}
 */

export const extractTextFromPDF = async (pdfBuffer) => {
  try {
    // pdf-parse expects a Uint8Array, not a Buffer
    const parser = new PDFParse(new Uint8Array(pdfBuffer));
    const data = await parser.getText();

    return {
      text: data.text,
      numPages: data.numPages,
      info: data.info,
    };

  } catch (error) {
     console.log("PDF parsing error:", error);
     throw new Error("Failed to extract text from PDF");
  }
};