/**
 * $ node transfer/create_pull_funds.js DEBTOR_PRIVATE_KEY
 */
import {
  Account,
  PlainMessage,
  EmptyMessage,
  NetworkCurrencyMosaic,
  TransferTransaction,
  CosignatureTransaction,
  AggregateTransaction,
  LockFundsTransaction,
  TransactionType,
  Deadline,
  UInt64
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)

const debtor = Account.createFromPrivateKey(
  process.argv[2],
  env.NETWORK_TYPE
)

console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("Debtor:    %s", debtor.address.pretty())
console.log("Endpoint:  %s/account/%s", url, debtor.address.plain())
console.log("")

// 相手へ請求のメッセージを送信
const fromInitiatorTx = TransferTransaction.create(
  Deadline.create(),
  debtor.address,
  [],
  PlainMessage.create("Request for a refund 10 cat.currency"),
  env.NETWORK_TYPE,
)

// 相手が自分へモザイクを送るトランザクションを作成
const fromDebtorTx = TransferTransaction.create(
  Deadline.create(),
  initiator.address,
  [NetworkCurrencyMosaic.createRelative(10)],
  EmptyMessage,
  env.NETWORK_TYPE
)

// 配列に入れた順序で実行されていくので、メッセージ送信を先にする
const aggregateTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [
    fromInitiatorTx.toAggregate(initiator.publicAccount),
    fromDebtorTx.toAggregate(debtor.publicAccount)
  ],
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(50000)
)
const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onConfirmed: (_, info) => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    if(info.type == TransactionType.LOCK) {
      console.log("[LockFund confirmed!]")
      console.log("")
      util.announceAggregateBonded(url, signedTx)
    }
  }
})

util.listener(url, debtor.address, {
  onAggregateBondedAdded: (_, aggregateTx) => {
    // トランザクションの署名要求が届いたらdebtorはそれに署名する
    console.log("[Aggregate Bonded Added]")
    // メッセージの内容とモザイク量について同意して署名する
    const txForInitiator = aggregateTx.innerTransactions[0]
    const txForDebtor = aggregateTx.innerTransactions[1]
    console.log("Message: %o", txForInitiator.message)
    console.log("Amount: %o", txForDebtor.mosaics[0])
    console.log("")
    const cosignatureTx = CosignatureTransaction.create(aggregateTx)
    const signedCosignature = debtor.signCosignatureTransaction(cosignatureTx)
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
  env.NETWORK_TYPE,
  UInt64.fromUint(50000)
)

const signedLockFundsTx = initiator.sign(lockFundsTx, env.GENERATION_HASH)
util.announce(url, signedLockFundsTx)
