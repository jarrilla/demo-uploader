import express from 'express';
import Busboy from 'busboy'
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { PassThrough } from 'stream';

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

app.put('/upload', (req, res) => {

  console.debug(req.headers);

  try {
    const writtenFiles: string[] = [];
    const ignoredFiles: string[] = [];

    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: 100*1000000
      }
    });
  
    busboy.on('file', function(
      fieldName: string,
      file: NodeJS.ReadableStream,
      fileName,
      encoding,
      // mimeType
    ) {

      console.debug({ encoding });

      // // check file types first
      // const ext = fileName.split('.')[ fileName.split('.').length - 1 ];
      // if ( CHECK_EXT_AGAINST_ALLOWED(ext) !== true ) {
      //   ignoredFiles.push(fieldName);
      //   return file.resume();
      // }


      // writtenFiles.push(fieldName);
  
      // // on file limit just crap out error & unlink file
      // file.on('limit', function() {
  
      //   file.unpipe();
      //   req.unpipe();
  
      //   res.writeHead(400, { Connection: 'close' });
      //   res.end( JSON.stringify({
      //     success: false,
      //     error: `File ${fieldName} is too large!`,
      //   }) );
  
      //   // NOTE(jarrilla):
      //   // not trying to delete files from fs since this seems to brick the next attempt
      //   // when OS is trying to write to a file that got unlinked before OS deletes it, app hangs
      //   // fieldNames.forEach(s => fs.unlinkSync( path.join(__dirname, s) ));
      // });

      // pipe to filesystem

      const str = new PassThrough();

      file.on('data', function(data) {
        str.push(data);
      });

      file.on('end', function() {
        str.end();
      });

      const saveTo = path.join( __dirname, 'uploads', fileName );
      str.pipe( fs.createWriteStream(saveTo) );

      
      // file.
      //   pipe( new PassThrough() ).
      //   pipe( fs.createWriteStream(saveTo) );

      
      // file.pipe( fs.createWriteStream(saveTo, { flags: 'a' }) );
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

app.put('/rfq', (_req, res) => {
  console.debug('yo');
  res.status(201).send({ rfqFolderId: '2' })
});

app.all('*', (_req, res) => res.sendStatus(404));

app.listen(4000, () => console.log('listening on 4000'));