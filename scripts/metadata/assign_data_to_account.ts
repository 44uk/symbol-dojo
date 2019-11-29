/**
 * $ ts-node metadata/account.ts
 */
import {
  Account,
  NetworkType,
  Deadline,
  AccountMetadataTransaction,
  KeyGenerator,
  AggregateTransaction
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

if(env.INITIATOR_KEY === undefined) {
  throw new Error("You need to be set env variable PRIVATE_KEY")
}
if(env.GENERATION_HASH === undefined) {
  throw new Error("You need to be set env variable GENERATION_HASH")
}

const url = env.GATEWAT_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

const target = Account.generateNewAccount(env.NETWORK_TYPE)
const key = KeyGenerator.generateUInt64Key("KeyName")
// sha3_256のハッシュ値をUInt64にした値
// const buf = js_sha3_1.sha3_256.arrayBuffer(input)
// const result = new Uint32Array(buf)
// return new UInt64_1.UInt64([result[0], (result[1] | 0x80000000) >>> 0])
// const value "http://placehold.jp/100x100.png"
const value = "KeyValueA"

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Endpoint:  %s/metadata/account/%s", url, initiator.address.plain())
consola.info("")

const metaTx = AccountMetadataTransaction.create(
  Deadline.create(),
  initiator.publicKey,
  key,
  value.length,
  value,
  env.NETWORK_TYPE
)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [metaTx.toAggregate(initiator.publicAccount)],
  env.NETWORK_TYPE,
  []
)
const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => util.announce(url, signedTx),
  onStatus: (listener, info) => { listener.close() consola.info(info) },
  onConfirmed: (listener) => listener.close()
})
