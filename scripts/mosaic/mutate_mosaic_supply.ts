/**
 * $ ts-node mosaic/mutate_mosaic.ts deadbeefcafebabe 1000000 add|remove
 */
import {
  Account,
  MosaicId,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  Deadline,
  UInt64
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.GATEWAT_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

const mosIdent = process.argv[2]
const absSupply = parseInt(process.argv[3]) || 10000 * 1000000
const action = process.argv[4] || "add"
const mosId = new MosaicId(mosIdent)

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("MosaicHex: %s", mosId.toHex())
consola.info("Supply:    %s", absSupply)
consola.info("Action:    %s", action)
consola.info("Endpoint:  %s/mosaic/%s", url, mosId.toHex())
consola.info("")

const supplyAction = action === "remove"
  ? MosaicSupplyChangeAction.Decrease
  : MosaicSupplyChangeAction.Increase

const supplyTx = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  supplyAction,
  UInt64.fromUint(absSupply),
  env.NETWORK_TYPE,
  UInt64.fromUint(50000)
)

const signedTx = initiator.sign(supplyTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
