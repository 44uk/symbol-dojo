/**
 * $ ts-node multisig/build_3_level_mlms.ts
 */
import {
  Account,
  Deadline,
  UInt64,
  MultisigAccountModificationTransaction,
  TransferTransaction,
  AggregateTransaction,
  NetworkCurrencyMosaic,
  EmptyMessage,
} from "symbol-sdk"
import { env } from "../util"
import * as util from "../util"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

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
  consola.info("Endpoint: %s/account/%s/multisig/graph", url, account.address.plain())
  consola.info("")
}

// 新しいアカウントを生成してマルチシグを構築します
const accounts = [...Array(7)].map((_, idx) => {
  return Account.generateNewAccount(env.NETWORK_TYPE)
})

// 1つ目のアカウントを最上位のマルチシグ候補にする
const toBeRootMultisig = accounts[0]

// 2,3つ目のアカウントをハブマルチシグ候補にする
const toBeLeftMultisig = accounts[1]
const toBeRightMultisig = accounts[2]

// 左辺の連署者候補アカウント
const leftCosigners = accounts.slice(3, 5)
// 右辺の連署者候補アカウント
const rightCosigners = accounts.slice(5, 7)

// マルチシグアカウントとするアカウント情報を表示
showAccountInfo(toBeRootMultisig,  "# Root Multisig Account")
showAccountInfo(toBeLeftMultisig,  "$ Left Multisig Account")
showAccountInfo(toBeRightMultisig, "$ Right Multisig Account")

// -----------------------------------------------------------------------------

// いずれかの連署者が署名すれば承認とみなすため、`minApprovalDelta`は`1`とする
const convertLeftIntoMultisigTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  1, // minApprovalDelta
  2, // minRemovalDelta
  leftCosigners.map(c => c.publicAccount),
  [],
  env.NETWORK_TYPE
)

// -----------------------------------------------------------------------------

// 2人が署名して承認とみなすため、`minApprovalDelta`は`2`とする
const convertRightIntoMultisigTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2, // minApprovalDelta
  2, // minRemovalDelta
  rightCosigners.map(c => c.publicAccount),
  [],
  env.NETWORK_TYPE
)

// -----------------------------------------------------------------------------

// 2つのマルチシグアカウントが承認して承認とみなすため、`minApprovalDelta`は`2`とする
const convertIntoMultisigTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2, // minApprovalDelta
  2, // minRemovalDelta
  [ toBeLeftMultisig.publicAccount,
    toBeRightMultisig.publicAccount ],
  [],
  env.NETWORK_TYPE
)

// -----------------------------------------------------------------------------

// `Root` となるアカウントへマルチシグ化用の手数料分を渡しておく
const transferTx = TransferTransaction.create(
  Deadline.create(),
  toBeRootMultisig.address,
  [NetworkCurrencyMosaic.createRelative(1000)],
  EmptyMessage,
  env.NETWORK_TYPE,
  UInt64.fromUint(50000)
)
const signedTransferTx = initiator.sign(transferTx, env.GENERATION_HASH)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [ convertLeftIntoMultisigTx.toAggregate(toBeLeftMultisig.publicAccount),
    convertRightIntoMultisigTx.toAggregate(toBeRightMultisig.publicAccount),
    convertIntoMultisigTx.toAggregate(toBeRootMultisig.publicAccount) ],
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(200000)
)
const signedTx = toBeRootMultisig.signTransactionWithCosignatories(
  aggregateTx,
  [ toBeLeftMultisig, ...leftCosigners,
    toBeRightMultisig, ...rightCosigners ],
  env.GENERATION_HASH
)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTransferTx)
  },
  onConfirmed: (listener) => {
    listener.close()

    util.listener(url, toBeRootMultisig.address, {
      onOpen: () => {
        util.announce(url, signedTx)
      },
      onConfirmed: (listener) => listener.close()
    })
  }
})

