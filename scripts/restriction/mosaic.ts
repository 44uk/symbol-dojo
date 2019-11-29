/**
 * $ ts-node filter/mosaic.ts MOSAIC_HEX block add
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
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.GATEWAT_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEYEY,
  env.NETWORK_TYPE
)

const mosaicHex = process.argv[2]
const propertyType = process.argv[3] || "block"
const modType = process.argv[4] || "add"
const mosaicId = new MosaicId(mosaicHex)

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Subject:   %s", mosaicId.toHex())
consola.info("Property:  %s", propertyType)
consola.info("Modify:    %s", modType)
consola.info("Endpoint:  %s/account/%s/restrictions", url, initiator.publicKey)
consola.info("Endpoint:  %s/mosaic/%s", url, mosaicId.toHex())
consola.info("")

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
