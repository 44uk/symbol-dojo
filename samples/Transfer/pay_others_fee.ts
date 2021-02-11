/**
 * $ ts-node transfer/create_pull_funds.ts SENDER_PRIVATE_KEY
 */
import {
  Account,
  EmptyMessage,
  NetworkCurrencyMosaic,
  TransferTransaction,
  CosignatureTransaction,
  AggregateTransaction,
  LockFundsTransaction,
  TransactionType,
  Deadline,
  UInt64,
  PlainMessage
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

// const sender = Account.createFromPrivateKey(
//   process.argv[2],
//   env.NETWORK_TYPE
// )
const sender = Account.generateNewAccount(
  env.NETWORK_TYPE
)

const receiver = Account.generateNewAccount(
  env.NETWORK_TYPE
)

consola.info("Sender:    %s", sender.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, sender.address.plain())
consola.info("Receiver:  %s", receiver.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, receiver.address.plain())
consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("")

// AliceがBobへ通貨を渡す
const fromSenderTx = TransferTransaction.create(
  Deadline.create(),
  receiver.address,
  [],
  PlainMessage.create("Hello! It's free message"),
  env.NETWORK_TYPE,
  UInt64.fromUint(50000)
)

// トランザクションに署名をする
const signedTx2 = sender.sign(fromSenderTx, env.GENERATION_HASH)

// トランザクション成功/失敗,未承認,承認のモニタリング接続
util.listener(url, initiator.address, {
  onOpen: () => {
    // 署名済みトランザクションを発信
    util.announce(url, signedTx2)
  },
  onConfirmed: (listener) => listener.close()
})




/*

// ProviderがAliceへ手数料分の基軸通貨を渡す
const fromInitiatorTx = TransferTransaction.create(
  Deadline.create(),
  sender.address,
  [NetworkCurrencyMosaic.createAbsolute(fromSenderTx.size * 100)],
  EmptyMessage,
  env.NETWORK_TYPE,
  UInt64.fromUint(50000)
)

// 配列に入れた順序で実行されていくので、メッセージ送信を先にする
const aggregateTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [ fromInitiatorTx.toAggregate(initiator.publicAccount),
    fromSenderTx.toAggregate(sender.publicAccount) ],
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

util.listener(url, sender.address, {
  onAggregateBondedAdded: (_, aggregateTx) => {
    // トランザクションの署名要求が届いたらdebtorはそれに署名する
    consola.info("[Aggregate Bonded Added]")
    // メッセージの内容とモザイク量について同意して署名する
    const [
      txFromInitiator,
      txFromSender
    ] = aggregateTx.innerTransactions
    consola.info("Message: %o", txFromInitiator.message)
    consola.info("Amount: %o", txFromSender.mosaics[0])
    consola.info("")
    const cosignatureTx = CosignatureTransaction.create(aggregateTx)
    const signedCosignature = sender.signCosignatureTransaction(cosignatureTx)
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

*/
