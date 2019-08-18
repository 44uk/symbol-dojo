/**
 * $ node mosaic/create_mosaic_with_supply.js 1000000
 */
const {
  Account,
  NetworkType,
  MosaicNonce,
  MosaicId,
  MosaicProperties,
  MosaicDefinitionTransaction,
  MosaicSupplyType,
  MosaicSupplyChangeTransaction,
  AggregateTransaction,
  UInt64,
  Deadline
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);

const absSupply = process.argv[2] || 1000000;
const blocks = process.argv[3];
const nonce = MosaicNonce.createRandom();
const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount);

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Nonce:     %s', nonce.toDTO());
console.log('MosaicHex: %s', mosId.toHex());
console.log('Blocks:    %s', blocks ? blocks : 'Infinity');
console.log('Supply:    %s', absSupply);
console.log('Endpoint:  %s/mosaic/%s', url, mosId.toHex());
console.log('');

const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  MosaicProperties.create({
    duration: blocks ? UInt64.fromUint(blocks) : undefined,
    divisibility: 0,
    supplyMutable: true,
    transferable: true,
    levyMutable: false
  }),
  NetworkType.MIJIN_TEST
);

const supplyTx = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  MosaicSupplyType.Increase,
  UInt64.fromUint(absSupply),
  NetworkType.MIJIN_TEST
);

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [
    definitionTx.toAggregate(initiator.publicAccount),
    supplyTx.toAggregate(initiator.publicAccount)
  ],
  NetworkType.MIJIN_TEST,
  []
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(aggregateTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
