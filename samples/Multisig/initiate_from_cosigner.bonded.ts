/**
 * $ ts-node multisig/initiate_from_cosigner.ts COSIGNATOR_PRIVATE_KEY MULTISIG_PUBLIC_KEY RECIPIENT_ADDRESS AMOUNT
 */
import {
  Account,
  PublicAccount,
  NetworkType,
  Address,
  NetworkCurrencyMosaic,
  PlainMessage,
  TransferTransaction,
  AggregateTransaction,
  LockFundsTransaction,
  CosignatureTransaction,
  UInt64,
  Deadline
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)
const cosignator = Account.createFromPrivateKey(
  process.argv[2],
  env.NETWORK_TYPE
)
const multisig = PublicAccount.createFromPublicKey(
  process.argv[3],
  env.NETWORK_TYPE
)
const recipient = Address.createFromRawAddress(process.argv[4])
const amount = parseInt(process.argv[5]) || 0

consola.info("Initiator:  %s", initiator.address.pretty())
consola.info("Endpoint:   %s/account/%s", url, initiator.address.plain())
consola.info("Cosignator: %s", cosignator.address.pretty())
consola.info("Endpoint:   %s/account/%s", url, cosignator.address.plain())
consola.info("Multisig:   %s", multisig.address.pretty())
consola.info("Endpoint:   %s/account/%s", url, multisig.address.plain())
consola.info("Amount:     %d", amount)
consola.info("Recipient:  %s", recipient.pretty())
consola.info("Endpoint:   %s/account/%s", url, recipient.plain())
consola.info("")

const transferTx = TransferTransaction.create(
  Deadline.create(),
  recipient,
  [NetworkCurrencyMosaic.createRelative(amount)],
  PlainMessage.create("Transaction from multisig account signed by cosigner."),
  env.NETWORK_TYPE
)

// マルチシグトランザクションはアグリゲートボンドトランザクションとして行う
const multisigTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [ transferTx.toAggregate(multisig) ],
  env.NETWORK_TYPE
)
const signedMultisigTx = initiator.sign(multisigTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    const lockFundsTx = LockFundsTransaction.create(
      Deadline.create(),
      NetworkCurrencyMosaic.createRelative(10),
      UInt64.fromUint(480),
      signedMultisigTx,
      env.NETWORK_TYPE
    )
    const signedLockFundsTx = initiator.sign(lockFundsTx, env.GENERATION_HASH)
    util.announce(url, signedLockFundsTx)
  },
  onConfirmed: () => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    util.announceAggregateBonded(url, signedMultisigTx)
  },
  onAggregateBondedAdded: (aggregateTx) => {
    // 連署者が署名することでマルチシグアカウントからのモザイク送信を承認する
    const cosignatureTx = CosignatureTransaction.create(aggregateTx)
    const signedCosignatureTx = cosignator.signCosignatureTransaction(cosignatureTx)
    util.announceAggregateBondedCosignature(url, signedCosignatureTx)
  }
})
