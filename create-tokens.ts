import { Sdk } from '@unique-nft/substrate-client';
import { KeyringProvider } from '@unique-nft/accounts/keyring';
import '@unique-nft/substrate-client/tokens';
import { readFileSync, writeFileSync } from 'fs';
import { attributes } from './attributes';
import { INFTMetadata } from './upload-images';

const MNEMONIC = 'bus ahead nation nice damp recall place dance guide media clap language';
const CHAIN_WS_URL = 'wss://ws-opal.unique.network';
const NFTS_METADATA_FILE = 'nfts_metadata.json';
const COLLECTION_ID = 1399;

function getAttributeIdx(name: string, attrName: string) {
  const attribute = attributes.find((attr) => attr.name === name);
  return attribute?.attrNames.indexOf(attrName);
}

export async function createToken(
  sdk: Sdk,
  address: string,
  collectionId: number,
  nftMetadata: INFTMetadata,
) {
  const { parsed: { tokenId } } = await sdk.tokens.create.submitWaitResult({
    address,
    collectionId,
    data: {
      image: {
        ipfsCid: nftMetadata.cid as string,
      },
      encodedAttributes: nftMetadata.attributes.reduce(
        (acc, { name, value }, attrIdx) => ({
          ...acc,
          [attrIdx]: getAttributeIdx(name, value),
        }),
        {},
      ),
      // encodedAttributes: {
      //   0: 0,
      //   1: { '_': 'Murzik' },
      //   2: [1, 2, 3],
      // },
    }
  });


  return tokenId;
}

async function main() {
  const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
  const address = signer.getAddress();
  const sdk = new Sdk({
    chainWsUrl: CHAIN_WS_URL,
    signer,
  });
  await sdk.connect();

  const fileData = readFileSync(NFTS_METADATA_FILE);
  const nftsMetadata = JSON.parse(fileData.toString()) as INFTMetadata[];

  for (let nftsIdx = 0; nftsIdx < nftsMetadata.length; nftsIdx++) {
    const nftMetadata = nftsMetadata[nftsIdx];
    const tokenId = await createToken(sdk, address, COLLECTION_ID, nftMetadata);
    console.log('Token created with id: ', tokenId);
    nftMetadata.tokenId = tokenId;
  }
  
  writeFileSync(NFTS_METADATA_FILE, JSON.stringify(nftsMetadata));
  await sdk.api.disconnect();
}

main();
