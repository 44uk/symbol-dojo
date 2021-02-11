/**
 * $ ts-node multisig/initiate_from_cosigner_without_cosigner.ts MULTISIG_PUBLIC_KEY RECIPIENT_ADDRESS AMOUNT
 */
import {
  Account,
  PublicAccount,
  Address,
  NetworkCurrencyMosaic,
  TransferTransaction,
  AggregateTransaction,
  PlainMessage,
  Deadline,
  UInt64
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)
const multisig = PublicAccount.createFromPublicKey(
  process.argv[2],
  env.NETWORK_TYPE
)
const recipient = Address.createFromRawAddress(process.argv[3])
const amount = parseInt(process.argv[4] || "0")

consola.info("Initiator:  %s", initiator.address.pretty())
consola.info("Endpoint:   %s/account/%s", url, initiator.address.plain())
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
  env.NETWORK_TYPE,
  UInt64.fromUint(500000)
)

// 1-of-m のマルチシグなら他に署名者が不要なのでコンプリートで送信できる
const multisigTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [transferTx.toAggregate(multisig)],
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(500000)
)

const signedTx = initiator.sign(multisigTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  }
})
