/**
 * $ node scripts/mosaic/create_mosaic_with_supply.js 1000000
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const absSupply = process.argv[2] || 1000000;
const blocks = process.argv[3];
const nonce = nem.MosaicNonce.createRandom();
const mosId = nem.MosaicId.createFromNonce(nonce, initiator.publicAccount);

console.log('initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Nonce:     %s', nonce.toDTO());
console.log('MosaicHex: %s', mosId.toHex());
console.log('Blocks:    %s', blocks ? blocks : 'Infinity');
console.log('Supply:    %s', absSupply);
console.log('Endpoint:  %s/mosaic/%s', url, mosId.toHex());
console.log('');

const definitionTx = nem.MosaicDefinitionTransaction.create(
  nem.Deadline.create(),
  nonce,
  mosId,
  nem.MosaicProperties.create({
    duration: blocks ? nem.UInt64.fromUint(blocks) : undefined,
    divisibility: 0,
    supplyMutable: true,
    transferable: true,
    levyMutable: false
  }),
  nem.NetworkType.MIJIN_TEST
);

const supplyTx = nem.MosaicSupplyChangeTransaction.create(
  nem.Deadline.create(),
  mosId,
  nem.MosaicSupplyType.Increase,
  nem.UInt64.fromUint(absSupply),
  nem.NetworkType.MIJIN_TEST
);

const aggregateTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  [
    definitionTx.toAggregate(initiator.publicAccount),
    supplyTx.toAggregate(initiator.publicAccount)
  ],
  nem.NetworkType.MIJIN_TEST,
  []
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(aggregateTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
