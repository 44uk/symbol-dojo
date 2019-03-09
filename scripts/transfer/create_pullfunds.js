/**
 * $ node scripts/transfer/create_pullfunds.js DEBTOR_PRIVATE_KEY
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const debtor = nem.Account.createFromPrivateKey(
  process.argv[2],
  nem.NetworkType.MIJIN_TEST
);

console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
console.log('Debtor:    %s', debtor.address.pretty());
console.log('Endpoint:  %s/account/%s', url, debtor.address.plain());
console.log('');

const fromInitiaterTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  debtor.address,
  [],
  nem.PlainMessage.create('Request for a refund 10 cat.currency'),
  nem.NetworkType.MIJIN_TEST
);

const fromDebtorTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  initiater.address,
  [nem.NetworkCurrencyMosaic.createRelative(10)],
  nem.EmptyMessage,
  nem.NetworkType.MIJIN_TEST
);

const aggregateTx = nem.AggregateTransaction.createBonded(
  nem.Deadline.create(),
  [
    fromInitiaterTx.toAggregate(initiater.publicAccount),
    fromDebtorTx.toAggregate(debtor.publicAccount)
  ],
  nem.NetworkType.MIJIN_TEST
);
const signedTx = initiater.sign(aggregateTx);

util.listener(url, initiater.address, {
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
  const signedLockFundsTx = initiater.sign(lockFundsTx);

  util.announce(url, signedLockFundsTx)
})();
