/**
 * $ node mosaic/mutate_mosaic.js deadbeefcafebabe 1000000 add|remove
 */
import {
  Account,
  MosaicId,
  NetworkType,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  Deadline,
  UInt64
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)

const mosIdent = process.argv[2]
const absSupply = process.argv[3] ? parseInt(process.argv[3]) : 10000 * 1000000
const action = process.argv[4] || "add"
const mosId = new MosaicId(mosIdent)

console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("MosaicHex: %s", mosId.toHex())
console.log("Supply:    %s", absSupply)
console.log("Action:    %s", action)
console.log("Endpoint:  %s/mosaic/%s", url, mosId.toHex())
console.log("")

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
