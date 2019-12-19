/**
 * $ node mosaic/create_mosaic_with_supply.js 1000000
 */
import {
  Account,
  NetworkType,
  MosaicNonce,
  MosaicId,
  MosaicFlags,
  MosaicDefinitionTransaction,
  MosaicSupplyChangeTransaction,
  MosaicSupplyChangeAction,
  AggregateTransaction,
  UInt64,
  Deadline
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)

const absSupply = process.argv[2] ? parseInt(process.argv[2]) : 10000 * 1000000
const blocks = process.argv[3] ? parseInt(process.argv[3]) : 0 // NOTE: 現在の仕様だと1blockにつき、1cat.currencyかかる
const nonce = MosaicNonce.createRandom()
const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount)
const flags = MosaicFlags.create(
  true, // SupplyMutable
  true, // Transferable
  true  // Restrictable
)

console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("Nonce:     %s", nonce)
console.log("MosaicHex: %s", mosId.toHex())
console.log("Blocks:    %s", blocks === 0 ? blocks : "Infinity")
console.log("Supply:    %s", absSupply)
console.log("Endpoint:  %s/mosaic/%s", url, mosId.toHex())
console.log("")

const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  flags,
  0,
  UInt64.fromUint(blocks),
  env.NETWORK_TYPE
)

const supplyTx = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  MosaicSupplyChangeAction.Increase,
  UInt64.fromUint(absSupply),
  env.NETWORK_TYPE
)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [ definitionTx.toAggregate(initiator.publicAccount),
    supplyTx.toAggregate(initiator.publicAccount) ],
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(5000000)
)

const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
