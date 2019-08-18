/**
 * $ node namespace/register_namespace_atomically.js aaa.bbb.ccc
 */
const {
  Account,
  NetworkType,
  NamespaceId,
  RegisterNamespaceTransaction,
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
const blocks = process.argv[3] || 1000; // NOTE: 現時点の仕様だと1blockにつき1cat.currencyかかる
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

// 各レベルの登録トランザクションを生成
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

// アグリゲートコンプリートトランザクション組み立て
// トランザクションは前から処理されるので辻褄が合うように順序には気をつける
const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  txes.map(tx => tx.toAggregate(initiator.publicAccount)),
  // 子から作ろうとするとエラーになる
  // txes.map(tx => tx.toAggregate(initiator.publicAccount)).reverse(),
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
