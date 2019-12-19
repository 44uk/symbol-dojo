/**
 * $ node transfer/raw_private_key_transaction.js PRIVATE_KEY RECIPIENT
 */
import {
  Account,
  Address,
  NetworkCurrencyMosaic,
  EmptyMessage,
  TransferTransaction,
  Deadline,
  NetworkType
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL

const initiator = Account.createFromPrivateKey(
  process.argv[2],
  env.NETWORK_TYPE
)
const recipient = process.argv[3] ?
  Address.createFromRawAddress(process.argv[3]):
  initiator.address

console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("Recipient: %s", recipient.pretty())
console.log("Endpoint:  %s/account/%s", url, recipient.plain())
console.log("")

const mosaics = [NetworkCurrencyMosaic.createRelative(0)]
const transferTx = TransferTransaction.create(
  Deadline.create(23),
  recipient,
  mosaics,
  EmptyMessage,
  env.NETWORK_TYPE
)

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(transferTx, env.GENERATION_HASH)
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
