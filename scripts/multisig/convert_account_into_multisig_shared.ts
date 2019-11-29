/**
 * $ node multisig/convert_account_into_multisig_shared.js
 */
import {
  Account,
  NetworkType,
  MultisigCosignatoryModification,
  MultisigCosignatoryModificationType,
  ModifyMultisigAccountTransaction,
  AggregateTransaction,
  Deadline
} from 'nem2-sdk'
import * as util from '../util'
import { env } from '../env'

const url = env.API_URL || 'http://localhost:3000'
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
)

const minApprovalDelta = 1 // 1人の承認でよい
const minRemovalDelta = 2 // 連署者を外すには2人に承認が必要

console.log('Initiator: %s', initiator.address.pretty())
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain())
console.log('')

const showAccountInfo = (account, label = null) => {
  label && console.log(label)
  console.log('Private:  %s', account.privateKey)
  console.log('Public:   %s', account.publicKey)
  console.log('Address:  %s', account.address.pretty())
  console.log('Endpoint: %s/account/%s', url, account.address.plain())
  console.log('Endpoint: %s/account/%s/multisig', url, account.address.plain())
  console.log('')
}

// 便宜上連署者として新しいアカウントを生成してマルチシグを構築します。
const accounts = [...Array(2)].map((_, idx) => {
  return Account.generateNewAccount(NetworkType.MIJIN_TEST)
})

// 1つ目のアカウントをマルチシグ化候補にする
const toBeMultisig = accounts[0]
// それ以降は連署者候補とする
const cosigners = accounts.slice(1)
// 環境変数にセットしているアカウントも連署者として追加する
cosigners.push(initiator)

// マルチシグアカウントとするアカウント情報を表示
showAccountInfo(toBeMultisig, 'Multisig Account')

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
  NetworkType.MIJIN_TEST
)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [ convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount) ],
  NetworkType.MIJIN_TEST
)

util.listener(url, toBeMultisig.address, {
  onOpen: () => {
    // 連署者アカウントによる署名を回避するために`signTransactionWithCosignatories`を使う
    const signedTx = toBeMultisig.signTransactionWithCosignatories(
      aggregateTx,
      cosigners,
      env.GENERATION_HASH
    )
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
