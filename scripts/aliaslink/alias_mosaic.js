/**
 * $ node scripts/alias/alias_mosaic.js namespaceString mosaicHex
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const namespace = process.argv[2];
const mosaicHex = process.argv[3];

const nsId = new nem.NamespaceId(namespace);
const mosId = new nem.MosaicId(mosaicHex);

console.log('initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Namespace: %s', nsId.fullName);
console.log('Endpoint:  %s/namespace/%s', url, nsId.toHex());
console.log('MosaicHex: %s', mosId.toHex());
console.log('Endpoint:  %s/mosaic/%s', url, mosId.toHex());
console.log('');

const aliasTx = nem.MosaicAliasTransaction.create(
  nem.Deadline.create(),
  nem.AliasActionType.Link,
  nsId,
  mosId,
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(aliasTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
