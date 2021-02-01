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
const accounts = [...Array(9)].map((_, idx) => {
  return Account.generateNewAccount(env.NETWORK_TYPE)
})

// 1つ目のアカウントを最上位のマルチシグ候補にする
const toBeRootMultisig = accounts[0]

// 2,3,4つ目のアカウントをマルチシグハブ候補にする
const toBeHub1Multisig = accounts[1]
const toBeHub2Multisig = accounts[2]
const toBeHub3Multisig = accounts[3]

// 残りを連署者候補にする
const cosigner = accounts[4]
const hub2Cosigners = accounts.slice(5, 7)
const hub3Cosigners = accounts.slice(7, 9)

// マルチシグアカウントとするアカウント情報を表示
showAccountInfo(toBeRootMultisig, "# Root Multisig Account")
showAccountInfo(toBeHub1Multisig, "# Hub1 Multisig Account")
showAccountInfo(toBeHub2Multisig, "$ Hub2 Multisig Account")
showAccountInfo(toBeHub3Multisig, "$ Hub3 Multisig Account")
showAccountInfo(cosigner, "$ Singer Account")

// -----------------------------------------------------------------------------

const convertRootIntoMultisigTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  1, // minApprovalDelta
  2, // minRemovalDelta
  [ cosigner.publicAccount,
    toBeHub1Multisig.publicAccount ],
  [],
  env.NETWORK_TYPE
)

// -----------------------------------------------------------------------------

const convertHub1IntoMultisigTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  1, // minApprovalDelta
  2, // minRemovalDelta
  [ toBeHub2Multisig.publicAccount,
    toBeHub3Multisig.publicAccount ],
  [],
  env.NETWORK_TYPE
)

// -----------------------------------------------------------------------------

const convertHub2IntoMultisigTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  1, // minApprovalDelta
  2, // minRemovalDelta
  hub2Cosigners.map(_ => _.publicAccount),
  [],
  env.NETWORK_TYPE
)

// -----------------------------------------------------------------------------

const convertHub3IntoMultisigTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  1, // minApprovalDelta
  2, // minRemovalDelta
  hub3Cosigners.map(_ => _.publicAccount),
  [],
  env.NETWORK_TYPE
)

// -----------------------------------------------------------------------------

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [ convertHub3IntoMultisigTx.toAggregate(toBeHub3Multisig.publicAccount),
    convertHub2IntoMultisigTx.toAggregate(toBeHub2Multisig.publicAccount),
    convertHub1IntoMultisigTx.toAggregate(toBeHub1Multisig.publicAccount),
    convertRootIntoMultisigTx.toAggregate(toBeRootMultisig.publicAccount) ],
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(5000000)
)
const signedTx = toBeRootMultisig.signTransactionWithCosignatories(
  aggregateTx,
  [ toBeHub1Multisig, cosigner,
    toBeHub2Multisig, ...hub2Cosigners,
    toBeHub3Multisig, ...hub3Cosigners ],
  env.GENERATION_HASH
)

// -----------------------------------------------------------------------------

// `Root` となるアカウントへマルチシグ化用の手数料分を渡しておく
const transferTx = TransferTransaction.create(
  Deadline.create(),
  toBeRootMultisig.address,
  [NetworkCurrencyMosaic.createRelative(500)],
  EmptyMessage,
  env.NETWORK_TYPE,
  UInt64.fromUint(5000000)
)
const signedTransferTx = initiator.sign(transferTx, env.GENERATION_HASH)

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
