/**
 * $ node scripts/mosaic/create_named_mosaic.js aaa.bbb.ccc 100
 */
const {
  Account,
  NetworkType,
  MosaicNonce,
  MosaicId,
  NamespaceId,
  MosaicSupplyType,
  AliasActionType,
  RegisterNamespaceTransaction,
  MosaicProperties,
  MosaicDefinitionTransaction,
  MosaicAliasTransaction,
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

const namespace = process.argv[2];
const blocks = process.argv[4] || 100;
const parts = namespace.split('.');

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Blocks:    %s', blocks);
parts.reduce((accum, part) => {
  accum.push(part);
  const ns = new NamespaceId(accum.join('.'));
  console.log('Namespace: %s (%s)', ns.fullName, ns.toHex());
  console.log('Endpoint:  %s/namespace/%s', url, ns.toHex());
  return accum;
}, []);
console.log('');

// register namespaces
const txes = parts.reduce((accum, part, idx, array) => {
  const parent = array.slice(0, idx).join('.');
  let registerTx;
  if (accum.length === 0) {
    registerTx = RegisterNamespaceTransaction.createRootNamespace(
      Deadline.create(),
      part,
      UInt64.fromUint(blocks),
      NetworkType.MIJIN_TEST
    );
  } else {
    registerTx = RegisterNamespaceTransaction.createSubNamespace(
      Deadline.create(),
      part,
      parent,
      NetworkType.MIJIN_TEST
    );
  }
  accum.push(registerTx);
  return accum;
}, []);

// create mosaic
const nonce = MosaicNonce.createRandom();
const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount);
const absSupply = process.argv[3];

console.log('Mosaic Nonce: %s', nonce.toDTO());
console.log('Mosaic Hex:   %s', mosId.toHex());
console.log('Supply:       %s', absSupply);
console.log('Endpoint:     %s/mosaic/%s', url, mosId.toHex());
console.log('');

const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  MosaicProperties.create({
    supplyMutable: true,
    transferable: true,
    levyMutable: false,
    divisibility: 0,
    duration: UInt64.fromUint(blocks)
  }),
  NetworkType.MIJIN_TEST
);
txes.push(definitionTx)

const supplyTx = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  MosaicSupplyType.Increase,
  UInt64.fromUint(absSupply),
  NetworkType.MIJIN_TEST
);
txes.push(supplyTx)

// link
const nsId = new NamespaceId(namespace);
const aliasTx = MosaicAliasTransaction.create(
  Deadline.create(),
  AliasActionType.Link,
  nsId,
  mosId,
  NetworkType.MIJIN_TEST
);
txes.push(aliasTx)

console.log('Txes Len: ', txes.length);
console.log('');
const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  txes.map(tx => tx.toAggregate(initiator.publicAccount)),
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
