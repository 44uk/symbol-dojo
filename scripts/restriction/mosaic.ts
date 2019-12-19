/**
 * $ node filter/mosaic.js MOSAIC_HEX block add
 */
import {
  Account,
  NetworkType,
  MosaicId,
  PropertyType,
  PropertyModificationType,
  AccountPropertyTransaction,
  AccountPropertyModification,
  Deadline
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)

const mosaicHex = process.argv[2]
const propertyType = process.argv[3] || "block"
const modType = process.argv[4] || "add"
const mosaicId = new MosaicId(mosaicHex)

console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("Subject:   %s", mosaicId.toHex())
console.log("Property:  %s", propertyType)
console.log("Modify:    %s", modType)
console.log("Endpoint:  %s/account/%s/restrictions", url, initiator.publicKey)
console.log("Endpoint:  %s/mosaic/%s", url, mosaicId.toHex())
console.log("")

const propType = propertyType === "allow"
  ? PropertyType.AllowMosaic
  : PropertyType.BlockMosaic
const propModType = modType === "remove"
  ? PropertyModificationType.Remove
  : PropertyModificationType.Add

const mosaicPropertyFilter = AccountPropertyModification.createForMosaic(
  propModType,
  mosaicId
)

const propModTx = AccountPropertyTransaction.createMosaicPropertyModificationTransaction(
  Deadline.create(),
  propType,
  [mosaicPropertyFilter],
  env.NETWORK_TYPE
)

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(propModTx, env.GENERATION_HASH)
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
