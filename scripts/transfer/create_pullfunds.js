/**
 * $ node scripts/transfer/create_pullfunds.js DEBTOR_PRIVATE_KEY
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const debtor = nem.Account.createFromPrivateKey(
  process.argv[2],
  nem.NetworkType.MIJIN_TEST
);

console.log('initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Debtor:    %s', debtor.address.pretty());
console.log('Endpoint:  %s/account/%s', url, debtor.address.plain());
console.log('');

// 相手へ請求のメッセージを送信
const frominitiatorTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  debtor.address,
  [],
  nem.PlainMessage.create('Request for a refund 10 cat.currency'),
  nem.NetworkType.MIJIN_TEST
);

// 相手が自分へモザイクを送るトランザクションを作成
const fromDebtorTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  initiator.address,
  [nem.NetworkCurrencyMosaic.createRelative(10)],
  nem.EmptyMessage,
  nem.NetworkType.MIJIN_TEST
);

// 配列に入れた順序で実行されていくので、メッセージ送信を先にする
const aggregateTx = nem.AggregateTransaction.createBonded(
  nem.Deadline.create(),
  [
    frominitiatorTx.toAggregate(initiator.publicAccount),
    fromDebtorTx.toAggregate(debtor.publicAccount)
  ],
  nem.NetworkType.MIJIN_TEST
);
const signedTx = initiator.sign(aggregateTx, process.env.GENERATION_HASH);

util.listener(url, initiator.address, {
  onConfirmed: (info) => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    if(info.type == nem.TransactionType.LOCK) {
      console.log('[LockFund confirmed!]')
      console.log('')
      util.announceAggregateBonded(url, signedTx)
    }
  }
})

util.listener(url, debtor.address, {
  onAggregateBondedAdded: (aggregateTx) => {
    // トランザクションの署名要求が届いたらdebtorはそれに署名する
    console.log('[Aggregate Bonded Added]')
    // メッセージの内容とモザイク量について同意して署名する
    const txForInitiator = aggregateTx.innerTransactions[0]
    const txForDebtor = aggregateTx.innerTransactions[1]
    console.log('Message: %o', txForInitiator.message)
    console.log('Amount: %o', txForDebtor.mosaics[0])
    console.log('')
    const cosignatureTx = nem.CosignatureTransaction.create(aggregateTx);
    const signedCosignature = debtor.signCosignatureTransaction(cosignatureTx);
    util.announceAggregateBondedCosignature(url, signedCosignature)
  }
})

;(async () => {
  // 保証金のような役割であるLockFundTransactionを作成する
  const mosId = await new nem.NamespaceHttp(url)
    .getLinkedMosaicId(new nem.NamespaceId('cat.currency'))
    .toPromise();
  const lockFundMosaic = new nem.Mosaic(mosId, nem.UInt64.fromUint(10000000))
  // NOTE: 現状ではこの方法で指定できないようだ
  // const lockFundMosaic = nem.NetworkCurrencyMosaic.createRelative(10)
  const lockFundsTx = nem.LockFundsTransaction.create(
    nem.Deadline.create(),
    lockFundMosaic,
    nem.UInt64.fromUint(480),
    signedTx,
    nem.NetworkType.MIJIN_TEST
  );

  const signedLockFundsTx = initiator.sign(lockFundsTx, process.env.GENERATION_HASH);
  util.announce(url, signedLockFundsTx)
})();
