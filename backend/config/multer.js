import multer from 'multer';
import path from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';
const _filename = fileURLToPath(import.meta.url);
const _dirname  =path.dirname(_filename);
   
const uploadDir = path.join(_dirname, '../uploads/documents');
if(!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir,{recursive: true});
}

//configure storage
 
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,uploadDir);
  },
  filename:(req,file,cb)=>{
    const uniqueSufix= Date.now + '-' + Math.round(Math.random()*1E9);
    cb(null,`${uniqueSufix}-${file.originalname}`);
  }
});
//file filter - only pdf
const fileFilter = (req,file,cb)=>{
  if(file.mimetype === 'application/pdf'){
    cb(null,true);
  }
else{
  cb(new Error('only PDF files are allowed'),false);
}
};

//configure multer
const upload = multer({
  storage:storage,
  fileFilter: fileFilter,
  limits:{
     fileSize:parseInt(process.env.MAX_FILE_SIZE)||10485760  //10MB default
  }
});
 export default upload;