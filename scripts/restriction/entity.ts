/**
 * $ ts-node filter/entity.ts type block add
 */
import {
  Account,
  NetworkType,
  PropertyType,
  TransactionType,
  PropertyModificationType,
  AccountPropertyTransaction,
  AccountPropertyModification,
  Deadline
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEYEY,
  env.NETWORK_TYPE
)

const entType = process.argv[2] || "TRANSFER"
const propType = process.argv[3] || "block"
const modType = process.argv[4] || "add"

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Subject:   %s", entType)
consola.info("Property:  %s", propType)
consola.info("Modify:    %s", modType)
consola.info("Endpoint:  %s/account/%s/restrictions", url, initiator.publicKey)
consola.info("")

const entityType = TransactionType[entType]

const propertyType = propType === "allow"
  ? PropertyType.AllowTransaction
  : PropertyType.BlockTransaction
const propertyModificationType = modType === "remove"
  ? PropertyModificationType.Remove
  : PropertyModificationType.Add

const entityTypePropertyFilter = AccountPropertyModification.createForEntityType(
  propertyModificationType,
  entityType
)

const propModTx = AccountPropertyTransaction.createEntityTypePropertyModificationTransaction(
  Deadline.create(),
  propertyType,
  [entityTypePropertyFilter],
  env.NETWORK_TYPE
)

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(propModTx, env.GENERATION_HASH)
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
