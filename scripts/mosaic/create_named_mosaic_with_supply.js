/**
 * $ node scripts/mosaic/create_named_mosaic.js aaa.bbb.ccc 100
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const namespace = process.argv[2];
const blocks = process.argv[4] || 100;
const parts = namespace.split('.');

console.log('initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Blocks:    %s', blocks);
parts.reduce((accum, part) => {
  accum.push(part);
  const ns = new nem.NamespaceId(accum.join('.'));
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
    registerTx = nem.RegisterNamespaceTransaction.createRootNamespace(
      nem.Deadline.create(),
      part,
      nem.UInt64.fromUint(blocks),
      nem.NetworkType.MIJIN_TEST
    );
  } else {
    registerTx = nem.RegisterNamespaceTransaction.createSubNamespace(
      nem.Deadline.create(),
      part,
      parent,
      nem.NetworkType.MIJIN_TEST
    );
  }
  accum.push(registerTx);
  return accum;
}, []);

// create mosaic
const nonce = nem.MosaicNonce.createRandom();
const mosId = nem.MosaicId.createFromNonce(nonce, initiator.publicAccount);
const absSupply = process.argv[3];

console.log('Mosaic Nonce: %s', nonce.toDTO());
console.log('Mosaic Hex:   %s', mosId.toHex());
console.log('Supply:       %s', absSupply);
console.log('Endpoint:     %s/mosaic/%s', url, mosId.toHex());
console.log('');

const definitionTx = nem.MosaicDefinitionTransaction.create(
  nem.Deadline.create(),
  nonce,
  mosId,
  nem.MosaicProperties.create({
    supplyMutable: true,
    transferable: true,
    levyMutable: false,
    divisibility: 0,
    duration: nem.UInt64.fromUint(blocks)
  }),
  nem.NetworkType.MIJIN_TEST
);
txes.push(definitionTx)

const supplyTx = nem.MosaicSupplyChangeTransaction.create(
  nem.Deadline.create(),
  mosId,
  nem.MosaicSupplyType.Increase,
  nem.UInt64.fromUint(absSupply),
  nem.NetworkType.MIJIN_TEST
);
txes.push(supplyTx)

// link
const nsId = new nem.NamespaceId(namespace);
const aliasTx = nem.MosaicAliasTransaction.create(
  nem.Deadline.create(),
  nem.AliasActionType.Link,
  nsId,
  mosId,
  nem.NetworkType.MIJIN_TEST
);
txes.push(aliasTx)

console.log('Txes Len: ', txes.length);
console.log('');
const aggregateTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  txes.map(tx => tx.toAggregate(initiator.publicAccount)),
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
