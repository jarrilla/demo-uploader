import express from 'express';
import Busboy from 'busboy'
import fs from 'fs';
import path from 'path';
import cors from 'cors';

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

app.post('/upload', (req, res) => {

  try {
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
      const ext = fileName.split('.')[ fileName.split('.').length - 1 ];
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
  
      // pipe to filesystem
      const saveTo = path.join( __dirname, 'uploads', fieldName+'.'+ext );
      file.pipe( fs.createWriteStream(saveTo) );
    });
  
    // done uploading. send 200
    busboy.on('finish', function() {

      const statusCode = ignoredFiles.length ? 413 : 200;

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

app.all('*', (_req, res) => res.sendStatus(404));

app.listen(4000, () => console.log('listening on 4000'));