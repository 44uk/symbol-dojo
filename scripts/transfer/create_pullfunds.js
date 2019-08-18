/**
 * $ node transfer/create_pullfunds.js DEBTOR_PRIVATE_KEY
 */
const {
  Account,
  PlainMessage,
  EmptyMessage,
  NamespaceId,
  NamespaceHttp,
  Mosaic,
  NetworkCurrencyMosaic,
  TransferTransaction,
  CosignatureTransaction,
  AggregateTransaction,
  LockFundsTransaction,
  TransactionType,
  Deadline,
  NetworkType,
  UInt64
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);

const debtor = Account.createFromPrivateKey(
  process.argv[2],
  NetworkType.MIJIN_TEST
);

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Debtor:    %s', debtor.address.pretty());
console.log('Endpoint:  %s/account/%s', url, debtor.address.plain());
console.log('');

// 相手へ請求のメッセージを送信
const frominitiatorTx = TransferTransaction.create(
  Deadline.create(),
  debtor.address,
  [],
  PlainMessage.create('Request for a refund 10 cat.currency'),
  NetworkType.MIJIN_TEST
);

// 相手が自分へモザイクを送るトランザクションを作成
const fromDebtorTx = TransferTransaction.create(
  Deadline.create(),
  initiator.address,
  [NetworkCurrencyMosaic.createRelative(10)],
  EmptyMessage,
  NetworkType.MIJIN_TEST
);

// 配列に入れた順序で実行されていくので、メッセージ送信を先にする
const aggregateTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [
    frominitiatorTx.toAggregate(initiator.publicAccount),
    fromDebtorTx.toAggregate(debtor.publicAccount)
  ],
  NetworkType.MIJIN_TEST
);
const signedTx = initiator.sign(aggregateTx, process.env.GENERATION_HASH);

util.listener(url, initiator.address, {
  onConfirmed: (info) => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    if(info.type == TransactionType.LOCK) {
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
    const cosignatureTx = CosignatureTransaction.create(aggregateTx);
    const signedCosignature = debtor.signCosignatureTransaction(cosignatureTx);
    util.announceAggregateBondedCosignature(url, signedCosignature)
  }
})

// 保証金のような役割であるLockFundTransactionを作成する
const lockFundMosaic = NetworkCurrencyMosaic.createRelative(10)
const lockFundsTx = LockFundsTransaction.create(
  Deadline.create(),
  lockFundMosaic,
  UInt64.fromUint(480),
  signedTx,
  NetworkType.MIJIN_TEST
);

const signedLockFundsTx = initiator.sign(lockFundsTx, process.env.GENERATION_HASH);
util.announce(url, signedLockFundsTx);
