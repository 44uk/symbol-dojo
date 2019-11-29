/**
 * $ node filter/address.js SDPF2RAQ6CUSOHCJD5U7YWRYF7Y3GRXNKTBL5C2V block add
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
} from 'nem2-sdk'
import * as util from '../util'
import { env } from '../env'

const url = env.API_URL || 'http://localhost:3000'
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
)

const rawAddress = process.argv[2]
const propertyType = process.argv[3] || 'block'
const modType = process.argv[4] || 'add'
const address = Address.createFromRawAddress(rawAddress)

console.log('Initiator: %s', initiator.address.pretty())
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain())
console.log('Subject:   %s', address.pretty())
console.log('Property:  %s', propertyType)
console.log('Modify:    %s', modType)
console.log('Endpoint:  %s/account/%s/restrictions', url, initiator.publicKey)
console.log('Endpoint:  %s/account/%s', url, address.plain())
console.log('')

const propType = propertyType === 'allow'
  ? PropertyType.AllowAddress
  : PropertyType.BlockAddress

const propModType = modType === 'remove'
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
  NetworkType.MIJIN_TEST
)

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(propModTx, env.GENERATION_HASH)
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
