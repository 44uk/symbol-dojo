/**
 * $ node scripts/namespace/register_namespace.js japan 10000
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const namespace = process.argv[2];
const blocks = process.argv[3] || 100; // NOTE: 現在の仕様だと1blockにつき、1cat.currencyかかる
const nsId = new nem.NamespaceId(namespace);

console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
console.log('Namespace: %s (%s)', nsId.fullName, nsId.toHex());
console.log('Blocks:    %s', blocks);
console.log('Endpoint:  %s/namespace/%s', url, nsId.toHex());
console.log('');

// const [root, sub] = namespace.split(/(?<=^[^.]+)\./)
const [parent, child] = namespace.split(/\.(?=[^\.]+$)/)

let registerTx
if (child) {
  registerTx = nem.RegisterNamespaceTransaction.createSubNamespace(
    nem.Deadline.create(),
    child,
    parent,
    nem.NetworkType.MIJIN_TEST
  )
} else {
  registerTx = nem.RegisterNamespaceTransaction.createRootNamespace(
    nem.Deadline.create(),
    parent,
    nem.UInt64.fromUint(blocks),
    nem.NetworkType.MIJIN_TEST
  )
}

util.listener(url, initiater.address, {
  onOpen: () => {
    const signedTx = initiater.sign(registerTx);
    util.announce(url, signedTx);
  }
});
