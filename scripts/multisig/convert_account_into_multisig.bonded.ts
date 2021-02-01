/**
 * $ ts-node multisig/convert_account_into_multisig.bonded.ts __TO_BE_MULTIGIS_PRIVATE_KEY__
 */
import {
  Account,
  NetworkCurrencyMosaic,
  TransactionType,
  AggregateTransaction,
  MultisigAccountModificationTransaction,
  CosignatureTransaction,
  Deadline,
  HashLockTransaction,
  UInt64,
  TransferTransaction,
  EmptyMessage
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

// 引数の秘密鍵のアカウントをマルチシグ候補にする
// const toBeMultisig = Account.createFromPrivateKey(
//   process.argv[2],
//   env.NETWORK_TYPE
// )

const minApprovalDelta = 1 // トランザクションの承認には1人の署名が必要
const minRemovalDelta = 2 // 連署者を外すには2人に承認が必要

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("")

const showAccountInfo = (account: Account, label?: string) => {
  label && consola.info(label)
  consola.info("Private:  %s", account.privateKey)
  consola.info("Public:   %s", account.publicKey)
  consola.info("Address:  %s", account.address.pretty())
  consola.info("Endpoint: %s/account/%s", url, account.address.plain())
  consola.info("Endpoint: %s/account/%s/multisig", url, account.address.plain())
  consola.info("")
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
  UInt64.fromUint(500000)
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

// 連署アカウントになることを承認するために署名が要求される。
const aggregateTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [ convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount) ],
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(500000)
)
aggregateTx.setMaxFee(500)

const signedTx = toBeMultisig.sign(aggregateTx, env.GENERATION_HASH)

// cosigners.forEach(cosigner => {
//   util.listener(url, cosigner.address)
// })

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTransferTx)
  },
  onConfirmed: (listener) => {
    listener.close()

    util.listener(url, toBeMultisig.address, {
      onOpen: () => {
        const hashLockTx = HashLockTransaction.create(
          Deadline.create(),
          NetworkCurrencyMosaic.createRelative(10),
          UInt64.fromUint(480),
          signedTx,
          env.NETWORK_TYPE,
          UInt64.fromUint(500000)
        )
        const signedHashLockTx = toBeMultisig.sign(hashLockTx, env.GENERATION_HASH)
        consola.info("HashLock announced!")
        util.announce(url, signedHashLockTx)
      },
      onConfirmed: (listener, tx) => {
        if(tx.type === TransactionType.LOCK) {
          consola.info("HashLock confirmed!")
          util.announceAggregateBonded(url, signedTx)
        } else {
          listener.close()
        }
      },
      onAggregateBondedAdded: (_, aggTx) => {
        // 各連署アカウントに署名要求を署名させる
        const cosignatureTx = CosignatureTransaction.create(aggTx)
        consola.info("AggregateBonded added!")
        cosigners.forEach(cosigner => {
          const signedCosignatureTx = cosigner.signCosignatureTransaction(cosignatureTx)
          util.announceAggregateBondedCosignature(url, signedCosignatureTx)
        })
      }
    })
  }
})
