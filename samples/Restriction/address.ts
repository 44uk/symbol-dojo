/**
 * $ ts-node filter/address.ts SDPF2RAQ6CUSOHCJD5U7YWRYF7Y3GRXNKTBL5C2V block add
 */
import {
  Account,
  NetworkType,
  Address,
  PropertyType,
  PropertyModificationType,
  AccountPropertyModification,
  AccountPropertyTransaction,
  Deadline
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.GATEWAT_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEYEY,
  env.NETWORK_TYPE
)

const rawAddress = process.argv[2]
const propertyType = process.argv[3] || "block"
const modType = process.argv[4] || "add"
const address = Address.createFromRawAddress(rawAddress)

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Subject:   %s", address.pretty())
consola.info("Property:  %s", propertyType)
consola.info("Modify:    %s", modType)
consola.info("Endpoint:  %s/account/%s/restrictions", url, initiator.publicKey)
consola.info("Endpoint:  %s/account/%s", url, address.plain())
consola.info("")

const propType = propertyType === "allow"
  ? PropertyType.AllowAddress
  : PropertyType.BlockAddress

const propModType = modType === "remove"
  ? PropertyModificationType.Remove
  : PropertyModificationType.Add

const addressPropertyFilter = AccountPropertyModification.createForAddress(
  propModType,
  address
)

const propModTx = AccountPropertyTransaction.createAddressPropertyModificationTransaction(
  Deadline.create(),
  propType,
  [addressPropertyFilter],
  env.NETWORK_TYPE
)

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(propModTx, env.GENERATION_HASH)
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
