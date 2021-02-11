/**
 * $ ts-node transfer/create_pull_funds.ts DEBTOR_PRIVATE_KEY
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
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEYEY,
  env.NETWORK_TYPE
)

// const debtor = Account.createFromPrivateKey(
//   process.argv[2],
//   env.NETWORK_TYPE
// )
const debtor = Account.generateNewAccount(
  env.NETWORK_TYPE
)

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Debtor:    %s", debtor.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, debtor.address.plain())
consola.info("")

// 相手へ請求のメッセージを送信
const fromInitiatorTx = TransferTransaction.create(
  Deadline.create(),
  debtor.address,
  [],
  PlainMessage.create("Request for a refund 10 nem.xem"),
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
  [ fromInitiatorTx.toAggregate(initiator.publicAccount),
    fromDebtorTx.toAggregate(debtor.publicAccount) ],
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(50000)
)

const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onConfirmed: (_, info) => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    if(info.type == TransactionType.LOCK) {
      consola.info("[LockFund confirmed!]")
      consola.info("")
      util.announceAggregateBonded(url, signedTx)
    }
  }
})

util.listener(url, debtor.address, {
  onAggregateBondedAdded: (_, aggregateTx) => {
    // トランザクションの署名要求が届いたらdebtorはそれに署名する
    consola.info("[Aggregate Bonded Added]")
    // メッセージの内容とモザイク量について同意して署名する
    const [
      txFromInitiator,
      txFromDebtor
    ] = aggregateTx.innerTransactions
    consola.info("Message: %o", txFromInitiator.message)
    consola.info("Amount: %o", txFromDebtor.mosaics[0])
    consola.info("")
    const cosignatureTx = CosignatureTransaction.create(aggregateTx)
    const signedCosignature = debtor.signCosignatureTransaction(cosignatureTx)
    util.announceAggregateBondedCosignature(url, signedCosignature)
  }
})

// 保証金のような役割のLockFundTransactionを作成する
// 現時点での仕様として、基軸通貨(nem.xem)を`10`預け入れる必要があります。
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
