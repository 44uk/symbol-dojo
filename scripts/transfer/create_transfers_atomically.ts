/**
 * $ node transfer/create_transfers_atomically.ts 10
 */
import {
  Account,
  PlainMessage,
  NetworkCurrencyMosaic,
  TransferTransaction,
  AggregateTransaction,
  Deadline,
  NetworkType,
  UInt64
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)

const amount = parseInt(process.argv[2]) || 1

console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("")

// 便宜上宛先として新しいアカウントを生成
const recipients = [...Array(3)].map((_, idx) => {
  const account = Account.generateNewAccount(env.NETWORK_TYPE)
  console.log(`- account${idx + 1} ${"-".repeat(64)}`)
  console.log("Private:  %s", account.privateKey)
  console.log("Public:   %s", account.publicKey)
  console.log("Address:  %s", account.address.pretty())
  console.log("Endpoint: %s/account/%s", url, account.address.plain())
  return account
})
console.log("")

const mosaics = [NetworkCurrencyMosaic.createRelative(amount)]
const message = PlainMessage.create("Tip for you!")
const txes = recipients.map(account => {
  return TransferTransaction.create(
    Deadline.create(),
    account.address,
    mosaics,
    message,
    env.NETWORK_TYPE
  )
})

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  txes.map(tx => tx.toAggregate(initiator.publicAccount)),
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(50000)
)

const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
