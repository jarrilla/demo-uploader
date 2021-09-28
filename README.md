## file-uploader

(demo) Backend code for multi-file uploader

- `yarn install`
- `yarn start` or `yarn dev` to run. (start will use dist directory, dev will use src). All files uploaded will be saved to disk to dist/src directory.
- Use `POST localhost:4000/upload` to test.
- Possible status codes:
  - (200) Success
  - (413) File too large; Retry to upload all files.
  - (400) Invalid filetype.
  - (500) Unexpected server error.

### NOTE:
This demo will not remove files after a failed/partial upload due to some funny interactions with OS & fs.
Luckily fs overwrites files without any hesitation.
Live endpoints will delete all files from a failed/partial upload, however, so all files will have to be re-uploaded in case of failure.