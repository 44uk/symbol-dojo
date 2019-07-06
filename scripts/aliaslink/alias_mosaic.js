/**
 * $ node scripts/alias/alias_mosaic.js namespaceString mosaicHex
 */
const {
  Account,
  NetworkType,
  MosaicId,
  NamespaceId,
  AliasActionType,
  MosaicAliasTransaction,
  Deadline
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);

const namespace = process.argv[2];
const mosaicHex = process.argv[3];

const nsId = new NamespaceId(namespace);
const mosId = new MosaicId(mosaicHex);

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Namespace: %s', nsId.fullName);
console.log('Endpoint:  %s/namespace/%s', url, nsId.toHex());
console.log('MosaicHex: %s', mosId.toHex());
console.log('Endpoint:  %s/mosaic/%s', url, mosId.toHex());
console.log('');

const aliasTx = MosaicAliasTransaction.create(
  Deadline.create(),
  AliasActionType.Link,
  nsId,
  mosId,
  NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(aliasTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
