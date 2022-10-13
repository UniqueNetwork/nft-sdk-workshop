import { KeyringProvider } from '@unique-nft/accounts/keyring';
import { Sdk } from '@unique-nft/substrate-client';
import { AttributeType, COLLECTION_SCHEMA_NAME } from '@unique-nft/substrate-client/tokens';
import { attributes } from './attributes';

const MNEMONIC = 'bus ahead nation nice damp recall place dance guide media clap language';
const CHAIN_WS_URL = 'wss://ws-opal.unique.network';
const COLLECTION_NAME = 'Workoholics for workshop';
const COLLECTION_DESCRIPTION = 'Example of creating NFTs by SDK tools.';
const COVER_PICTURE = 'QmP5mEnyNzuF8yXUmwNzPCNhMWH7My3vbjimYjDu4ZJB8P';
const URL_TEMPLATE = 'https://ipfs.uniquenetwork.dev/ipfs/{infix}';


export async function createCollection(sdk: Sdk, address: string, formattedAttributes: any) {
  const { parsed: { collectionId } } = await sdk.collections.creation.submitWaitResult({
    address,
    name: COLLECTION_NAME,
    description: COLLECTION_DESCRIPTION,
    tokenPrefix: 'TST',
    schema: {
      schemaName: COLLECTION_SCHEMA_NAME.unique,
      schemaVersion: '1.0.0',
      coverPicture: {
        ipfsCid: COVER_PICTURE,
      },
      image: {
        urlTemplate: URL_TEMPLATE,
      },
      attributesSchemaVersion: '1.0.0',
      attributesSchema: formattedAttributes,
        // 0: {
        //   name: { '_': 'sex' },
        //   type: AttributeType.string,
        //   optional: true,
        //   isArray: false,
        //   enumValues: {
        //     0: { '_': 'male' },
        //     1: { '_': 'female' }
        //   }
        // },
    },
  });

  console.log('Collection ID: ', collectionId);
}
async function main() {
  const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
  const sdk = new Sdk({
    chainWsUrl: CHAIN_WS_URL,
    signer,
  });
  
  const formattedAttributes = attributes.reduce(
    (acc, attr) => ({
      ...acc,
      [attributes.indexOf(attr)]: {
        name: { '_': attr.name },
        type: AttributeType.string,
        isArray: false,
        optional: false,
        enumValues: attr.attrNames.reduce(
          (acc, value) => ({ ...acc, [attr.attrNames.indexOf(value)]: { '_': value } }),
          {},
        ),
      }
    }),
    {},
  );

  await sdk.connect();
  await createCollection(sdk, signer.instance.address, formattedAttributes);
  await sdk.api.disconnect();
}

main();
