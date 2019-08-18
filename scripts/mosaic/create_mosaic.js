/**
 * $ node mosaic/create_mosaic.js 10000
 */
const {
  Account,
  NetworkType,
  MosaicNonce,
  MosaicId,
  MosaicProperties,
  MosaicDefinitionTransaction,
  UInt64,
  Deadline
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);

const blocks = process.argv[2];
const nonce = MosaicNonce.createRandom();
const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount);

console.log('Initiator:    %s', initiator.address.pretty());
console.log('Endpoint:     %s/account/%s', url, initiator.address.plain());
console.log('Mosaic Nonce: %s', nonce.toDTO());
console.log('Mosaic Hex:   %s', mosId.toHex());
console.log('Blocks:       %s', blocks ? blocks : 'Infinity');
console.log('Endpoint:     %s/mosaic/%s', url, mosId.toHex());
console.log('');

const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  MosaicProperties.create({
    duration: blocks ? UInt64.fromUint(blocks) : undefined,
    divisibility: 0,
    transferable: true,
    supplyMutable: true,
    levyMutable: false
  }),
  NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(definitionTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
