/**
 * $ ts-node multisig/convert_account_into_multisig.ts
 */
import {
  Account,
  MultisigCosignatoryModification,
  AggregateTransaction,
  Deadline,
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

const minApprovalDelta = 2 // 2人の承認が必要
const minRemovalDelta = 2 // 連署者を外すには2人に承認が必要

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("")

const showAccountInfo = (account: Account, label = "") => {
  label && consola.info(label)
  consola.info("Private:  %s", account.privateKey)
  consola.info("Public:   %s", account.publicKey)
  consola.info("Address:  %s", account.address.pretty())
  consola.info("Endpoint: %s/account/%s", url, account.address.plain())
  consola.info("Endpoint: %s/account/%s/multisig", url, account.address.plain())
  consola.info("")
}

// 便宜上連署者として新しいアカウントを生成してマルチシグを構築します。
const accounts = [...Array(3)].map((_, idx) => {
  return Account.generateNewAccount(env.NETWORK_TYPE)
})

// 1つ目のアカウントをマルチシグ候補にする
const toBeMultisig = accounts[0]
// それ以降は連署者候補とする
const cosigners = accounts.slice(1)
// 環境変数にセットしているアカウントも連署者として追加する
cosigners.push(initiator)

// マルチシグアカウントとするアカウント情報を表示
showAccountInfo(toBeMultisig, "Multisig Account")

// 連署者とするアカウントの公開アカウントの集合を作る
const cosignerPublicAccounts = cosigners.map((account, idx) => {
  showAccountInfo(account, `Cosigner Account${idx+1}:`)
  return account.publicAccount
})

// 連署者の追加定義集合を作る
const cosignatoryModifications = cosignerPublicAccounts.map(publicAccount => {
  return new MultisigCosignatoryModification(
    MultisigCosignatoryModificationType.Add,
    publicAccount
  )
})

const convertIntoMultisigTx = ModifyMultisigAccountTransaction.create(
  Deadline.create(),
  minApprovalDelta,
  minRemovalDelta,
  cosignatoryModifications,
  env.NETWORK_TYPE
)

// 実際はAggregateTransaction.createBondedメソッドを使い連署アカウントに署名を求める。
// 今回は連署アカウントの秘密鍵がわかっているのでそれらを利用して署名してしまう。
const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [ convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount) ],
  env.NETWORK_TYPE
)


// 連署者アカウントによる署名を回避するために`signTransactionWithCosignatories`を使う
const signedTx = toBeMultisig.signTransactionWithCosignatories(
  aggregateTx,
  cosigners,
  env.GENERATION_HASH
)

util.listener(url, toBeMultisig.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
