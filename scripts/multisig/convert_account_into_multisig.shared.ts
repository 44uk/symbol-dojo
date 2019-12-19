/**
 * $ node multisig/convert_account_into_multisig_shared.js
 */
import {
  Account,
  AggregateTransaction,
  MultisigAccountModificationTransaction,
  Deadline,
  UInt64,
  TransferTransaction,
  NetworkCurrencyMosaic,
  EmptyMessage
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)

const minApprovalDelta = 1 // トランザクションの承認には1人の署名が必要
const minRemovalDelta = 2 // 連署者を外す場合は2人の署名が必要

console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("")

const showAccountInfo = (account: Account, label?: string) => {
  label && console.log(label)
  console.log("Private:  %s", account.privateKey)
  console.log("Public:   %s", account.publicKey)
  console.log("Address:  %s", account.address.pretty())
  console.log("Endpoint: %s/account/%s", url, account.address.plain())
  console.log("Endpoint: %s/account/%s/multisig", url, account.address.plain())
  console.log("")
}

// 便宜上連署者として新しいアカウントを生成してマルチシグを構築します。
const accounts = [...Array(2)].map((_, idx) => {
  return Account.generateNewAccount(env.NETWORK_TYPE)
})

// 1つ目のアカウントをマルチシグ化候補にする
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

const convertIntoMultisigTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  minApprovalDelta,
  minRemovalDelta,
  cosignerPublicAccounts,
  [],
  env.NETWORK_TYPE,
  UInt64.fromUint(5000000)
)

// `Root` となるアカウントへマルチシグ化用の手数料分を渡しておく
const transferTx = TransferTransaction.create(
  Deadline.create(),
  toBeMultisig.address,
  [NetworkCurrencyMosaic.createRelative(1000)],
  EmptyMessage,
  env.NETWORK_TYPE,
  UInt64.fromUint(500000)
)
const signedTransferTx = initiator.sign(transferTx, env.GENERATION_HASH)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [ convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount) ],
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(500000)
)
aggregateTx.setMaxFee(500)

// 連署者アカウントによる署名を回避するために`signTransactionWithCosignatories`を使う
const signedTx = toBeMultisig.signTransactionWithCosignatories(
  aggregateTx,
  cosigners,
  env.GENERATION_HASH
)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTransferTx)
  },
  onConfirmed: (listener) => {
    listener.close()

    util.listener(url, toBeMultisig.address, {
      onOpen: () => {
        util.announce(url, signedTx)
      },
      onConfirmed: (listener) => listener.close()
    })
  }
})
