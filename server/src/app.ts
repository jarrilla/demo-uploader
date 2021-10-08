import express from 'express';
import Busboy from 'busboy'
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import CONSTANTS from './constants';

const app = express();
app.use( express.json() );
app.use( cors() );

const ALLOWED_FILE_TYPES = [
  'STEP',
  'STP',
  'SLDPRT',
  'STL',
  'DXF',
  'IPT',
  'X_T',
  'X_B',
  '3MF',
  '3DXML',
  'CATPART',
  'PRT',
  'SAT',
  'PDF',
  'DOCX',
  'DOC',
  'XLSX',
  'XLS',
  'CSV',
];
const CHECK_EXT_AGAINST_ALLOWED = (ext: String) =>
  ALLOWED_FILE_TYPES.includes( ext.toUpperCase() );

app.post('/upload/part-file/:personalInfoID', (req, res) => {

  try {
    const personalInfoID:string = req.params.personalInfoID
    const writtenFiles: string[] = [];
    const ignoredFiles: string[] = [];

    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: 100*1000000
      }
    });
  
    busboy.on('file', (
      fieldName: string,
      file: NodeJS.ReadableStream,
      fileName,
      // encoding,
      // mimeType
    ) => {

      // SIMULATE ERROR 
      // comment out to resume normal testing behavior
      // {
      //   req.unpipe();
      //   res.writeHead(400, { Connection: 'close' });
        
      //   return res.end( JSON.stringify({
      //     success: false,
      //     error: 'whatever'
      //   }) );
      // }


      // check file types first
      const ext:string = fileName.split('.')[ fileName.split('.').length - 1 ];
      if ( CHECK_EXT_AGAINST_ALLOWED(ext) !== true ) {
        ignoredFiles.push(fieldName);
        return file.resume();
      }


      writtenFiles.push(fieldName);
  
      // on file limit just crap out error & unlink file
      file.on('limit', function() {
  
        file.unpipe();
        req.unpipe();
  
        res.writeHead(400, { Connection: 'close' });

        res.end( JSON.stringify({
          success: false,
          error: `File ${fieldName} is too large!`,
        }) );
  
        // NOTE(jarrilla):
        // not trying to delete files from fs since this seems to brick the next attempt
        // when OS is trying to write to a file that got unlinked before OS deletes it, app hangs
        // fieldNames.forEach(s => fs.unlinkSync( path.join(__dirname, s) ));
      });
  
      let uniqueFileName =  'part-'  + personalInfoID + '-' + uuidv4()

      // pipe to filesystem
      const saveTo = path.join( __dirname, '..', 'uploads', uniqueFileName+'.'+ext );
      file.pipe( fs.createWriteStream(saveTo) );

    });
  
    // done uploading. send 200
    busboy.on('finish', function() {
      const statusCode:number = ignoredFiles.length ? 413 : 200;
      
      //write personal info update with uploaded file url code here
      if(statusCode === 200){
        
      }
      // ==============================================================

      res.writeHead( statusCode, { Connection: 'close' } );
      res.end( JSON.stringify({
        success: !ignoredFiles.length,
        ignoredFiles
      }));
    });
  
    return req.pipe(busboy);
  }
  catch (e) {
    req.unpipe();

    console.error(e);
    res.writeHead(500, { Connection: 'close' });
    res.end( JSON.stringify({
      success: false,
      error: `Unknown error`,
    }) );
  }
});

app.post('/upload/rfq-file/:personalInfoID', (req, res) => {

  try {
    const personalInfoID:string = req.params.personalInfoID
    const writtenFiles: string[] = [];
    const ignoredFiles: string[] = [];

    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: 100*1000000
      }
    });
  
    busboy.on('file', (
      fieldName: string,
      file: NodeJS.ReadableStream,
      fileName,
      // encoding,
      // mimeType
    ) => {
      
      // check file types first
      const ext:string = fileName.split('.')[ fileName.split('.').length - 1 ];
      if ( CHECK_EXT_AGAINST_ALLOWED(ext) !== true ) {
        ignoredFiles.push(fieldName);
        return file.resume();
      }


      writtenFiles.push(fieldName);
  
      // on file limit just crap out error & unlink file
      file.on('limit', function() {
  
        file.unpipe();
        req.unpipe();
  
        res.writeHead(400, { Connection: 'close' });

        res.end( JSON.stringify({
          success: false,
          error: `File ${fieldName} is too large!`,
        }) );
  
        // NOTE(jarrilla):
        // not trying to delete files from fs since this seems to brick the next attempt
        // when OS is trying to write to a file that got unlinked before OS deletes it, app hangs
        // fieldNames.forEach(s => fs.unlinkSync( path.join(__dirname, s) ));
      });
  
      let uniqueFileName =  'rfq-'  + personalInfoID + '-' + uuidv4()

      // pipe to filesystem
      const saveTo = path.join( __dirname, '..', 'uploads', uniqueFileName+'.'+ext );
      file.pipe( fs.createWriteStream(saveTo) );

    });
  
    // done uploading. send 200
    busboy.on('finish', function() {
      const statusCode:number = ignoredFiles.length ? 413 : 200;
      
      //write personal info update with uploaded file url code here
      if(statusCode === 200){
        
      }
      // ==============================================================

      res.writeHead( statusCode, { Connection: 'close' } );
      res.end( JSON.stringify({
        success: !ignoredFiles.length,
        ignoredFiles
      }));
    });
  
    return req.pipe(busboy);
  }
  catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});  

app.post('/upload/common-file/:personalInfoID/:fileType', (req, res) => {

  try {
    const personalInfoID:string = req.params.personalInfoID
    const fileType:string = req.params.fileType
    const writtenFiles: string[] = [];
    const ignoredFiles: string[] = [];

    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: 100*1000000
      }
    });
  
    busboy.on('file', (
      fieldName: string,
      file: NodeJS.ReadableStream,
      fileName,
      // encoding,
      // mimeType
    ) => {
      
      // check file types first
      const ext:string = fileName.split('.')[ fileName.split('.').length - 1 ];
      if ( CHECK_EXT_AGAINST_ALLOWED(ext) !== true ) {
        ignoredFiles.push(fieldName);
        return file.resume();
      }


      writtenFiles.push(fieldName);
  
      // on file limit just crap out error & unlink file
      file.on('limit', function() {
  
        file.unpipe();
        req.unpipe();
  
        res.writeHead(400, { Connection: 'close' });

        res.end( JSON.stringify({
          success: false,
          error: `File ${fieldName} is too large!`,
        }) );
  
        // NOTE(jarrilla):
        // not trying to delete files from fs since this seems to brick the next attempt
        // when OS is trying to write to a file that got unlinked before OS deletes it, app hangs
        // fieldNames.forEach(s => fs.unlinkSync( path.join(__dirname, s) ));
      });
  
      let uniqueFileName = fileType + '-'  + personalInfoID + '-' + uuidv4()

      // pipe to filesystem
      const saveTo = path.join( __dirname, '..', 'uploads', uniqueFileName+'.'+ext );
      file.pipe( fs.createWriteStream(saveTo) );

    });
  
    // done uploading. send 200
    busboy.on('finish', function() {
      const statusCode:number = ignoredFiles.length ? 413 : 200;
      
      //write personal info update with uploaded file url code here
      if(statusCode === 200){
        
      }
      // ==============================================================

      res.writeHead( statusCode, { Connection: 'close' } );
      res.end( JSON.stringify({
        success: !ignoredFiles.length,
        ignoredFiles
      }));
    });
  
    return req.pipe(busboy);
  }
  catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.post('/personal-info', async (req, res) => {
  try {
    let personInfo:any = req.body
    personInfo.id = Date.now()
    //Write person info create code in database

    // getting site key from client side
    const response_key:string = personInfo.token;
    // Put secret key here, which we get from google console
    const secret_key:string = CONSTANTS.GOOGOLE_CAPTCHA_SECRECT_KEY;
  
    // Hitting POST request to the URL, Google will
    // respond with success or error scenario.
    const url:string =`${CONSTANTS.CAPTCHA_TOKEN_VERIFY_URL}?secret=${secret_key}&response=${response_key}`;
  
    axios({
      method: 'post',
      url: url,
      data: {}
    }).then((response:any) => {
      if(response.data.success){
        //write personal information insert code for database here

        // ==========================================================
        return res.status(200).json({
          success: true,
          data: personInfo
        })
      }else{
        return res.status(400).json({
          success: false,
          message: 'invalid google captcha validation'
        })
      }
    })
  }catch(e){

  }
});

app.all('*', (_req, res) => res.sendStatus(404));

app.listen(4000, () => console.log('listening on 4000'));