import { readFileSync, createReadStream, writeFileSync } from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import mime from 'mime-types';
import { basename } from 'path';

const NFTS_METADATA_FILE = 'nfts_metadata.json';
const URL = 'https://rest.unique.network/opal/v1/ipfs/upload-file';

interface INFTMetadata {
  image: string;
  attributes: Array<{ name: string; value: string; }>
  cid?: string;
  fileUrl?: string;
}

interface IServerResponse {
  cid: string;
  fileUrl: string;
}

const metadataFile = readFileSync(NFTS_METADATA_FILE);
const nftsMetadata = JSON.parse(metadataFile.toString()) as INFTMetadata[];

async function main() {
  for (let imageIdx = 0; imageIdx < nftsMetadata.length; imageIdx++) {
    const nftMetadata = nftsMetadata[imageIdx];
    const imagePath = nftMetadata.image;
    const form = new FormData();
    form.append(
      'file',
      createReadStream(imagePath),
      {
        contentType: mime.lookup(imagePath) as string,
        filename: basename(imagePath),
      },
    );

    console.log(`Uploading image: ${imagePath}`);
    const result = await fetch(URL, { method: 'POST', body: form });
    const { cid, fileUrl } = await result.json() as IServerResponse;
    console.log(`Image uploaded: ${fileUrl}`);
    nftMetadata.cid = cid;
    nftMetadata.fileUrl = fileUrl;
  }

  writeFileSync(NFTS_METADATA_FILE, JSON.stringify(nftsMetadata));
}

main();
