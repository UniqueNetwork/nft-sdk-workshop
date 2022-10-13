import mergeImg from 'merge-img';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const imageParts = [
  { name: 'head', attrNames: ['Regular Head'] },
  { name: 'eye', attrNames: ['Normal Eyes', 'Tired Eyes', 'Brused Eyes'] },
  { name: 'brow', attrNames: ['Thick Brows', 'Greyish Brows', 'Flat Brows'] },
  { name: 'nose', attrNames: ['Snub Nose', 'Button Nose', 'Droopy Nose'] },
  { name: 'hair', attrNames: ['Normal Hair', 'Hipster Style', 'Messy Hair', 'Overdue for Haircut', 'Bald Patches'] },
  { name: 'mouth', attrNames: ['Smirk', 'Regular Smile', 'Wide Smile'] }
];

const IMG_SRC_FOLDER = './images';
const NFTS_FOLDER = './nfts';
const NFTS_METADATA_FILE = 'nfts_metadata.json';

function createDirIfNotExist(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path);
  }
}

function genFaces(imageParts: any[]) {
  const faces: any[] = [];

  const recursion = (tuplePart: any[]) => {
    if (tuplePart.length === imageParts.length) {
      faces.push(tuplePart);
    } else {
      const array = imageParts[tuplePart.length].attrNames;
      for (const element of array) {
        const tuplePartWithNewElement = tuplePart.concat([{
          name: imageParts[tuplePart.length].name,
          value: element,
          image: `${imageParts[tuplePart.length].name}${array.indexOf(element) + 1}.png`,
        }]);
        recursion(tuplePartWithNewElement);
      }
    }

  };

  recursion([]);

  return faces;
}

async function genImage(images: any[], outputFile: string) {
  const image = await mergeImg(images);
  const saveResult = await image.write(outputFile);
  return image;
}

async function genImages(faces: any[]) {
  const images: any[] = [];

  createDirIfNotExist(NFTS_FOLDER);
  
  for(let faceIdx = 0; faceIdx < faces.length; faceIdx++) {
    const facePieces = faces[faceIdx];
    const outputFile = `${NFTS_FOLDER}/nft_image_${faceIdx}.png`;
    const faceImages = facePieces.map((piece: any) => ({
      src: `${IMG_SRC_FOLDER}/${piece.image}`,
      offsetX: piece.name === 'head' ? 0 :  -1706,
      offsetY: 0,
    }));

    const image = await genImage(faceImages, outputFile);
    console.log(`Image saved to: ${outputFile}`)

    images.push({
      image: outputFile,
      attributes: facePieces.map(({ name, value }: any) => ({ name, value })),
    });
  }

  return images;
}

function saveNftsMetadata(images: any[]) {
  writeFileSync(NFTS_METADATA_FILE, JSON.stringify(images));
}

async function main() {
  const faces = genFaces(imageParts);
  const first20Faces = faces.slice(0, 20);
  const images = await genImages(first20Faces);
  saveNftsMetadata(images);
  console.log('images: ', JSON.stringify(images, null, 2));
  console.log('length: ', faces.length);
}

main();
