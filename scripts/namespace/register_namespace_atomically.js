/**
 * $ node scripts/namespace/register_namespace_atomically.js aaa.bbb.ccc 10000
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const namespace = process.argv[2];
const blocks = process.argv[3] || 10000; //
const parts = namespace.split('.');

console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
console.log('Blocks:    %s', blocks);
parts.reduce((accum, part) => {
  accum.push(part);
  const ns = new nem.NamespaceId(accum.join('.'));
  console.log('Namespace: %s (%s)', ns.fullName, ns.toHex());
  console.log('Endpoint:  %s/namespace/%s', url, ns.toHex());
  return accum;
}, []);
console.log('');

// 各レベルの登録トランザクションを生成
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

// アグリゲートコンプリートトランザクション組み立て
// トランザクションは前から処理されるので辻褄が合うように順序には気をつける
const aggregateTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  txes.map(tx => tx.toAggregate(initiater.publicAccount)),
  // 子から作ろうとするとエラーになる
  // txes.map(tx => tx.toAggregate(initiater.publicAccount)).reverse(),
  nem.NetworkType.MIJIN_TEST,
  []
);

util.listener(url, initiater.address, {
  onOpen: () => {
    const signedTransaction = initiater.sign(aggregateTx);
    util.announce(url, signedTransaction);
  }
});
