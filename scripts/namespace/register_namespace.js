/**
 * $ node scripts/namespace/register_namespace.js japan 10000
 */
const {
  Account,
  NetworkType,
  NamespaceId,
  RegisterNamespaceTransaction,
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
const blocks = process.argv[3] || 100; // NOTE: 現在の仕様だと1blockにつき、1cat.currencyかかる
const nsId = new NamespaceId(namespace);

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Namespace: %s (%s)', nsId.fullName, nsId.toHex());
console.log('Blocks:    %s', blocks);
console.log('Endpoint:  %s/namespace/%s', url, nsId.toHex());
console.log('');

// const [root, sub] = namespace.split(/(?<=^[^.]+)\./)
const [parent, child] = namespace.split(/\.(?=[^\.]+$)/)

let registerTx
if (child) {
  registerTx = RegisterNamespaceTransaction.createSubNamespace(
    nem.Deadline.create(),
    child,
    parent,
    NetworkType.MIJIN_TEST
  )
} else {
  registerTx = RegisterNamespaceTransaction.createRootNamespace(
    Deadline.create(),
    parent,
    UInt64.fromUint(blocks),
    NetworkType.MIJIN_TEST
  )
}

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(registerTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
