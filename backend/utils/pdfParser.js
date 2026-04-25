import fs from 'fs/promises';
import {PDFParse} from 'pdf-parse'
/**
 * Extract text from pdf file
 * @param {string} filePath =path to PDFfile
 * @return {promise<{text: string,numpages:number}>}
 * */
export const extractTextFromPDF = async(filePath)=>{
 try{
  const dataBuffer =await fs.readFile(filePath);
  ////pdf-parse expects a Unit8Array,not a buffer
  const parser =new PDFParse({ data: dataBuffer });

  const  data = await parser.getText();
  return{
    text: data.text,
    numPages:data.numpages,
    info:data.info
  };
 }
 catch(error){
        console.error("PDF parsing error:",error);
        throw new Error("failed to extract text from file");

 }
};
