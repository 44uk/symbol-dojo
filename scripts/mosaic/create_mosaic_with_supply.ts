/**
 * $ ts-node mosaic/create_mosaic_with_supply.ts 1000000
 */
import {
  Account,
  MosaicNonce,
  MosaicId,
  MosaicFlags,
  MosaicDefinitionTransaction,
  MosaicSupplyChangeTransaction,
  MosaicSupplyChangeAction,
  AggregateTransaction,
  UInt64,
  Deadline
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.GATEWAT_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

const absSupply = parseInt(process.argv[2]) || 10000 * 1000000
const blocks = parseInt(process.argv[3]) || 0 // NOTE: 現在の仕様だと1blockにつき、1nem.xemかかる
const nonce = MosaicNonce.createRandom()
const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount)
const flags = MosaicFlags.create(
  true, // SupplyMutable
  true, // Transferable
  true  // Restrictable
)

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Nonce:     %s", nonce.nonce)
consola.info("MosaicHex: %s", mosId.toHex())
consola.info("Blocks:    %s", blocks !== 0 ? blocks : "non-expiring")
consola.info("Supply:    %s", absSupply)
consola.info("Endpoint:  %s/mosaic/%s", url, mosId.toHex())
consola.info("")

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
