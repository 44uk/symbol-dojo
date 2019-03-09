/**
 * $ node scripts/namespace/link_mosaic.js namespaceString mosaicHex
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const namespace = process.argv[2];
const mosaicHex = process.argv[3];

const nsId = new nem.NamespaceId(namespace);
const mosId = new nem.MosaicId(mosaicHex);

console.log('Initiater:  %s', initiater.address.pretty());
console.log('Endpoint:   %s/account/%s', url, initiater.address.plain());
console.log('Namespace:  %s', nsId.fullName);
console.log('Endpoint:   %s/namespace/%s', url, nsId.toHex());
console.log('Mosaic Hex: %s', mosId.toHex());
console.log('Endpoint:   %s/mosaic/%s', url, mosId.toHex());
console.log('');

const aliasTx = nem.MosaicAliasTransaction.create(
  nem.Deadline.create(),
  nem.AliasActionType.Link,
  nsId,
  mosId,
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, initiater.address, {
  onOpen: () => {
    const signedTransaction = initiater.sign(aliasTx);
    util.announce(url, signedTransaction);
  }
});
