import { Sdk } from '@unique-nft/substrate-client';
import { KeyringProvider } from '@unique-nft/accounts/keyring';
import '@unique-nft/substrate-client/tokens';
import { readFileSync } from 'fs';
import { attributes } from './attributes';
import { INFTMetadata } from './upload-images';
import { CreateMultipleTokensArguments } from '@unique-nft/substrate-client/tokens';

const MNEMONIC = 'bus ahead nation nice damp recall place dance guide media clap language';
const CHAIN_WS_URL = 'wss://ws-opal.unique.network';
const NFTS_METADATA_FILE = 'nfts_metadata.json';
const COLLECTION_ID = 1401;

function getAttributeIdx(name: string, attrName: string) {
  const attribute = attributes.find((attr) => attr.name === name);
  return attribute?.attrNames.indexOf(attrName);
}

async function main() {
  // https://github.com/UniqueNetwork/unique-sdk/tree/master/packages/substrate-client/tokens/methods/token/create-token
  // https://github.com/UniqueNetwork/unique-sdk/tree/master/packages/substrate-client/tokens/methods/token/create-multiple-tokens
  const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
  const address = signer.getAddress();
  const sdk = new Sdk({
    chainWsUrl: CHAIN_WS_URL,
    signer,
  });
  await sdk.connect();
  const fileData = readFileSync(NFTS_METADATA_FILE);
  const nftsMetadata = JSON.parse(fileData.toString()) as INFTMetadata[];
  
  const createMultiTokenArgs: CreateMultipleTokensArguments = {
    address: address,
    collectionId: COLLECTION_ID,
    data: nftsMetadata.map((nftMetadata) => ({
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
    })),
  };

  const result = await sdk.tokens.createMultiple.submitWaitResult(createMultiTokenArgs);
  console.log(JSON.stringify(result, null ,2));

  await sdk.api.disconnect();
}

main();
