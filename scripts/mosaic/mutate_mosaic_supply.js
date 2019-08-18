/**
 * $ node mosaic/mutate_mosaic.js deadbeefcafebabe 1000000 add|remove
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const mosIdent = process.argv[2];
const absSupply = process.argv[3];
const delta = process.argv[4] || 'add';
const mosId = new nem.MosaicId(mosIdent)

console.log('Initiator:  %s', initiator.address.pretty());
console.log('Endpoint:   %s/account/%s', url, initiator.address.plain());
console.log('Mosaic Hex: %s', mosId.toHex());
console.log('Supply:     %s', absSupply);
console.log('Delta:      %s', delta);
console.log('Endpoint:   %s/mosaic/%s', url, mosId.toHex());
console.log('');

const supplyType = delta === 'remove'
  ? nem.MosaicSupplyType.Decrease
  : nem.MosaicSupplyType.Increase

const supplyTx = nem.MosaicSupplyChangeTransaction.create(
  nem.Deadline.create(),
  mosId,
  supplyType,
  nem.UInt64.fromUint(absSupply),
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(supplyTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
