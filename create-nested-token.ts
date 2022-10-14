import { KeyringProvider } from '@unique-nft/accounts/keyring';
import { Sdk } from '@unique-nft/substrate-client';
import '@unique-nft/substrate-client/tokens';
import { NestTokenArguments } from '@unique-nft/substrate-client/tokens';

const MNEMONIC = 'bus ahead nation nice damp recall place dance guide media clap language';
const CHAIN_WS_URL = 'wss://ws-opal.unique.network';
const COLLECTION_ID = 1399;
const PARENT_TOKEN_ID = 1;
const CHILD_TOKEN_ID = 2;

async function main() {
  const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
  const address = signer.getAddress();
  const sdk = new Sdk({
    chainWsUrl: CHAIN_WS_URL,
    signer,
  });

  await sdk.connect();

  const args: NestTokenArguments = {
    address,
    parent: {
      collectionId: COLLECTION_ID,
      tokenId: PARENT_TOKEN_ID,
    },
    nested: {
      collectionId: COLLECTION_ID,
      tokenId: CHILD_TOKEN_ID,
    },
  };

  const result = await sdk.tokens.nest.submitWaitResult(args);

  const { tokenId, collectionId } = result.parsed;

  console.log(
    `Token ${tokenId} from collection ${collectionId} successfully nested`,
  );
  
  const token = await sdk.tokens.get({ collectionId, tokenId });

  console.log(`Token: ${JSON.stringify(token, null, 2)}`);

  await sdk.api.disconnect();
}

main();
