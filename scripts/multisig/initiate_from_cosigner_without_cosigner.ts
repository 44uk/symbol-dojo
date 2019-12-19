/**
 * $ node multisig/initiate_from_cosigner_without_cosigner.js MULTISIG_PUBLIC_KEY RECIPIENT_ADDRESS AMOUNT
 */
import {
  Account,
  PublicAccount,
  Address,
  NetworkCurrencyMosaic,
  TransferTransaction,
  AggregateTransaction,
  PlainMessage,
  Deadline
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)
const multisig = PublicAccount.createFromPublicKey(
  process.argv[2],
  env.NETWORK_TYPE
)
const recipient = Address.createFromRawAddress(process.argv[3])
const amount = parseInt(process.argv[4] || "0")

console.log("Initiator:  %s", initiator.address.pretty())
console.log("Endpoint:   %s/account/%s", url, initiator.address.plain())
console.log("Multisig:   %s", multisig.address.pretty())
console.log("Endpoint:   %s/account/%s", url, multisig.address.plain())
console.log("Amount:     %d", amount)
console.log("Recipient:  %s", recipient.pretty())
console.log("Endpoint:   %s/account/%s", url, recipient.plain())
console.log("")

const transferTx = TransferTransaction.create(
  Deadline.create(),
  recipient,
  [NetworkCurrencyMosaic.createRelative(amount)],
  PlainMessage.create("Transaction from multisig account signed by cosigner."),
  env.NETWORK_TYPE
)

// 1-of-m のマルチシグなら他に署名者が不要なのでコンプリートで送信できる
const multisigTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [transferTx.toAggregate(multisig)],
  env.NETWORK_TYPE,
  [],
)

const signedTx = initiator.sign(multisigTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  }
})
